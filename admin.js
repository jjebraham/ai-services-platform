const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const AIService = require('../models/AIService');
const SupportTicket = require('../models/SupportTicket');
const Settings = require('../models/Settings');
const { protect, authorize } = require('../middleware/auth');
const { getExchangeRateInfo, refreshExchangeRate } = require('../utils/exchangeRate');

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$accountStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const kycStats = await User.aggregate([
      {
        $group: {
          _id: '$kyc.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalUSD' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'email profile')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber status pricing createdAt');

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('email profile kyc.status accountStatus createdAt');

    // Get ticket statistics
    const ticketStats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get service statistics
    const serviceStats = await AIService.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalOrders: { $sum: '$stats.totalOrders' },
          totalRevenue: { $sum: '$stats.totalRevenue' }
        }
      }
    ]);

    // Calculate totals
    const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalOrders = orderStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = orderStats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
    const totalTickets = ticketStats.reduce((sum, stat) => sum + stat.count, 0);

    // Get exchange rate info
    const exchangeRateInfo = getExchangeRateInfo();

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalRevenue,
          totalTickets
        },
        userStats,
        kycStats,
        orderStats,
        ticketStats,
        serviceStats,
        recentOrders,
        recentUsers,
        exchangeRate: exchangeRateInfo
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), [
  query('status').optional().isIn(['active', 'suspended', 'deactivated']),
  query('kycStatus').optional().isIn(['pending', 'in_review', 'approved', 'rejected']),
  query('role').optional().isIn(['user', 'admin']),
  query('search').optional().isString(),
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

    const { status, kycStatus, role, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (status) query.accountStatus = status;
    if (kycStatus) query['kyc.status'] = kycStatus;
    if (role) query.role = role;

    if (search) {
      query.$or = [
        { email: new RegExp(search, 'i') },
        { 'profile.firstName': new RegExp(search, 'i') },
        { 'profile.lastName': new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's orders
    const orders = await Order.find({ user: user._id })
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's tickets
    const tickets = await SupportTicket.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        orders,
        tickets
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, authorize('admin'), [
  body('accountStatus').isIn(['active', 'suspended', 'deactivated']).withMessage('Valid account status is required'),
  body('reason').optional().trim().isLength({ min: 1 }).withMessage('Reason cannot be empty')
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

    const { accountStatus, reason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from suspending themselves
    if (user._id.toString() === req.user.id && accountStatus !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own account status'
      });
    }

    user.accountStatus = accountStatus;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${accountStatus} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders with filtering
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, authorize('admin'), [
  query('status').optional().isIn(['pending_payment', 'payment_processing', 'paid', 'processing', 'completed', 'cancelled', 'refunded', 'failed']),
  query('userId').optional().isMongoId(),
  query('serviceId').optional().isMongoId(),
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

    const { status, userId, serviceId, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (serviceId) query.service = serviceId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('user', 'email profile')
      .populate('service', 'name provider')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', protect, authorize('admin'), [
  body('status').isIn(['pending_payment', 'payment_processing', 'paid', 'processing', 'completed', 'cancelled', 'refunded', 'failed']).withMessage('Valid status is required'),
  body('note').optional().trim().isLength({ min: 1 }).withMessage('Note cannot be empty')
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

    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    order.status = status;
    await order.save();

    if (note) {
      await order.addTimelineEntry(status, note, req.user.id);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all services
// @route   GET /api/admin/services
// @access  Private/Admin
router.get('/services', protect, authorize('admin'), [
  query('category').optional().isIn(['language_model', 'image_generation', 'code_execution', 'data_analysis', 'other']),
  query('provider').optional().isString(),
  query('isActive').optional().isBoolean(),
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

    const { category, provider, isActive, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (provider) query.provider = new RegExp(provider, 'i');
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const services = await AIService.find(query)
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AIService.countDocuments(query);

    res.status(200).json({
      success: true,
      data: services,
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

// @desc    Create new service
// @route   POST /api/admin/services
// @access  Private/Admin
router.post('/services', protect, authorize('admin'), [
  body('name').trim().isLength({ min: 1 }).withMessage('Service name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category').isIn(['language_model', 'image_generation', 'code_execution', 'data_analysis', 'other']).withMessage('Valid category is required'),
  body('provider').trim().isLength({ min: 1 }).withMessage('Provider is required'),
  body('pricing.unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  body('pricing.unit').trim().isLength({ min: 1 }).withMessage('Pricing unit is required'),
  body('apiEndpoint').isURL().withMessage('Valid API endpoint is required')
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

    const service = await AIService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update service
// @route   PUT /api/admin/services/:id
// @access  Private/Admin
router.put('/services/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const service = await AIService.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete service
// @route   DELETE /api/admin/services/:id
// @access  Private/Admin
router.delete('/services/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const service = await AIService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Check if service has orders
    const orderCount = await Order.countDocuments({ service: service._id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete service with existing orders. Deactivate instead.'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get settings
// @route   GET /api/admin/settings
// @access  Private/Admin
router.get('/settings', protect, authorize('admin'), async (req, res, next) => {
  try {
    const settings = await Settings.find()
      .sort({ category: 1, key: 1 });

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      
      // Don't expose encrypted values in the response
      const settingObj = setting.toObject();
      if (setting.type === 'encrypted') {
        settingObj.value = '***ENCRYPTED***';
      }
      
      acc[setting.category].push(settingObj);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: groupedSettings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update setting
// @route   PUT /api/admin/settings/:key
// @access  Private/Admin
router.put('/settings/:key', protect, authorize('admin'), [
  body('value').exists().withMessage('Value is required'),
  body('type').optional().isIn(['string', 'number', 'boolean', 'object', 'array', 'encrypted'])
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

    const { value, type = 'string', category = 'general' } = req.body;

    const setting = await Settings.setValue(
      req.params.key,
      value,
      type,
      category,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Setting updated successfully',
      data: setting
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Refresh exchange rate
// @route   POST /api/admin/exchange-rate/refresh
// @access  Private/Admin
router.post('/exchange-rate/refresh', protect, authorize('admin'), async (req, res, next) => {
  try {
    const rate = await refreshExchangeRate();
    const info = getExchangeRateInfo();

    res.status(200).json({
      success: true,
      message: 'Exchange rate refreshed successfully',
      data: {
        rate,
        ...info
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

