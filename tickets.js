const express = require('express');
const { body, query, validationResult } = require('express-validator');
const SupportTicket = require('../models/SupportTicket');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const { uploadTicketAttachments, handleUploadError, deleteUploadedFiles, getFileInfo } = require('../middleware/upload');

const router = express.Router();

// @desc    Create new support ticket
// @route   POST /api/tickets
// @access  Private
router.post('/', protect, uploadTicketAttachments, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('category').isIn(['technical_support', 'billing', 'account', 'kyc', 'order_issue', 'feature_request', 'bug_report', 'general_inquiry', 'other']).withMessage('Valid category is required'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('relatedOrderId').optional().isMongoId().withMessage('Invalid order ID')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded files if validation fails
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, category, description, priority = 'medium', relatedOrderId } = req.body;

    // Validate related order if provided
    if (relatedOrderId) {
      const order = await Order.findById(relatedOrderId);
      if (!order || order.user.toString() !== req.user.id) {
        if (req.files) {
          deleteUploadedFiles(req.files);
        }
        return res.status(400).json({
          success: false,
          error: 'Invalid or unauthorized order reference'
        });
      }
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          ...getFileInfo(file),
          uploadedBy: req.user.id
        });
      });
    }

    // Create ticket
    const ticket = await SupportTicket.create({
      user: req.user.id,
      title,
      category,
      description,
      priority,
      relatedOrder: relatedOrderId || undefined,
      attachments,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    // Add initial message
    await ticket.addMessage(req.user.id, 'user', description, false, attachments);

    // Populate user info for response
    await ticket.populate('user', 'email profile');

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    // Delete uploaded files if error occurs
    if (req.files) {
      deleteUploadedFiles(req.files);
    }
    next(error);
  }
});

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private
router.get('/', protect, [
  query('status').optional().isIn(['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']),
  query('category').optional().isIn(['technical_support', 'billing', 'account', 'kyc', 'order_issue', 'feature_request', 'bug_report', 'general_inquiry', 'other']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, category, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await SupportTicket.find(query)
      .populate('relatedOrder', 'orderNumber status')
      .populate('assignedTo', 'profile.firstName profile.lastName')
      .sort({ 'metadata.lastActivity': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-messages'); // Don't include messages in list view

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'email profile')
      .populate('relatedOrder', 'orderNumber status service')
      .populate('assignedTo', 'profile.firstName profile.lastName')
      .populate('messages.sender', 'profile.firstName profile.lastName role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this ticket'
      });
    }

    // Mark messages as read for the current user
    await ticket.markAsRead(req.user.id);

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add message to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private
router.post('/:id/messages', protect, uploadTicketAttachments, [
  body('message').trim().isLength({ min: 1, max: 5000 }).withMessage('Message is required and must be less than 5000 characters'),
  body('isInternal').optional().isBoolean()
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { message, isInternal = false } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check permissions
    const isOwner = ticket.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add messages to this ticket'
      });
    }

    // Only admins can add internal messages
    if (isInternal && !isAdmin) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(403).json({
        success: false,
        error: 'Only admins can add internal messages'
      });
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push(getFileInfo(file));
      });
    }

    // Add message
    const senderType = isAdmin ? 'admin' : 'user';
    await ticket.addMessage(req.user.id, senderType, message, isInternal, attachments);

    // Populate the updated ticket
    await ticket.populate('messages.sender', 'profile.firstName profile.lastName role');

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      data: ticket
    });
  } catch (error) {
    if (req.files) {
      deleteUploadedFiles(req.files);
    }
    next(error);
  }
});

// @desc    Close ticket
// @route   PUT /api/tickets/:id/close
// @access  Private
router.put('/:id/close', protect, async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check permissions
    const isOwner = ticket.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to close this ticket'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Ticket is already closed'
      });
    }

    ticket.status = 'closed';
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all tickets (Admin only)
// @route   GET /api/tickets/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, authorize('admin'), [
  query('status').optional().isIn(['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']),
  query('category').optional().isIn(['technical_support', 'billing', 'account', 'kyc', 'order_issue', 'feature_request', 'bug_report', 'general_inquiry', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('assignedTo').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, category, priority, assignedTo, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await SupportTicket.find(query)
      .populate('user', 'email profile')
      .populate('relatedOrder', 'orderNumber status')
      .populate('assignedTo', 'profile.firstName profile.lastName')
      .sort({ 'metadata.lastActivity': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-messages'); // Don't include messages in list view

    const total = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Assign ticket (Admin only)
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
router.put('/:id/assign', protect, authorize('admin'), [
  body('assignedTo').optional().isMongoId().withMessage('Valid user ID is required')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { assignedTo } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    ticket.assignedTo = assignedTo || undefined;
    if (assignedTo && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket assignment updated successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update ticket status (Admin only)
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed']).withMessage('Valid status is required'),
  body('resolutionNote').optional().trim().isLength({ min: 1 }).withMessage('Resolution note cannot be empty')
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, resolutionNote } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Handle resolution
    if (status === 'resolved' && resolutionNote) {
      await ticket.resolve(req.user.id, resolutionNote);
    } else {
      ticket.status = status;
      await ticket.save();
    }

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get ticket statistics (Admin only)
// @route   GET /api/tickets/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      open: 0,
      in_progress: 0,
      waiting_for_customer: 0,
      resolved: 0,
      closed: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    // Get recent tickets
    const recentTickets = await SupportTicket.find()
      .populate('user', 'email profile')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('ticketNumber title status priority createdAt');

    res.status(200).json({
      success: true,
      data: {
        statusStats: formattedStats,
        categoryStats,
        priorityStats,
        recentTickets
      }
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware for file uploads
router.use(handleUploadError);

module.exports = router;

