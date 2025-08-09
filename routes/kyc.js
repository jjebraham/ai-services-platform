const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadKYCDocuments, handleUploadError, deleteUploadedFiles, getFileInfo } = require('../middleware/upload');
const { sendKYCStatusEmail } = require('../utils/email');

const router = express.Router();

// @desc    Submit KYC information
// @route   POST /api/kyc/submit
// @access  Private
router.post('/submit', protect, uploadKYCDocuments, [
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('address.street').trim().isLength({ min: 1 }).withMessage('Street address is required'),
  body('address.city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('address.country').trim().isLength({ min: 1 }).withMessage('Country is required'),
  body('address.postalCode').trim().isLength({ min: 1 }).withMessage('Postal code is required')
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

    // Check if files are uploaded
    if (!req.files || !req.files.idSelfie || !req.files.proofOfAddress) {
      if (req.files) {
        deleteUploadedFiles(req.files);
      }
      return res.status(400).json({
        success: false,
        error: 'Both ID selfie and proof of address are required'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if KYC is already approved
    if (user.kyc.status === 'approved') {
      deleteUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        error: 'KYC is already approved'
      });
    }

    const { firstName, lastName, dateOfBirth, phone, address } = req.body;

    // Update user profile and KYC information
    user.profile.firstName = firstName;
    user.profile.lastName = lastName;
    user.profile.dateOfBirth = new Date(dateOfBirth);
    user.profile.phone = phone;
    user.profile.address = {
      street: address.street,
      city: address.city,
      state: address.state || '',
      country: address.country,
      postalCode: address.postalCode
    };

    // Update KYC documents
    user.kyc.documents.idSelfie = getFileInfo(req.files.idSelfie[0]);
    user.kyc.documents.proofOfAddress = getFileInfo(req.files.proofOfAddress[0]);
    user.kyc.status = 'in_review';
    user.kyc.submittedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC information submitted successfully',
      data: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt
      }
    });
  } catch (error) {
    // Delete uploaded files if error occurs
    if (req.files) {
      deleteUploadedFiles(req.files);
    }
    next(error);
  }
});

// @desc    Get KYC status
// @route   GET /api/kyc/status
// @access  Private
router.get('/status', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        status: user.kyc.status,
        submittedAt: user.kyc.submittedAt,
        reviewedAt: user.kyc.reviewedAt,
        rejectionReason: user.kyc.rejectionReason,
        hasDocuments: !!(user.kyc.documents.idSelfie && user.kyc.documents.proofOfAddress)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all pending KYC submissions (Admin only)
// @route   GET /api/kyc/pending
// @access  Private/Admin
router.get('/pending', protect, authorize('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({
      'kyc.status': 'in_review'
    })
    .select('email profile kyc createdAt')
    .sort({ 'kyc.submittedAt': -1 })
    .skip(skip)
    .limit(limit);

    const total = await User.countDocuments({
      'kyc.status': 'in_review'
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get KYC details for review (Admin only)
// @route   GET /api/kyc/review/:userId
// @access  Private/Admin
router.get('/review/:userId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('email profile kyc createdAt lastLogin');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve or reject KYC (Admin only)
// @route   PUT /api/kyc/review/:userId
// @access  Private/Admin
router.put('/review/:userId', protect, authorize('admin'), [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject'),
  body('rejectionReason').optional().trim().isLength({ min: 1 }).withMessage('Rejection reason is required when rejecting')
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

    const { action, rejectionReason } = req.body;

    // Validate rejection reason for reject action
    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason is required when rejecting KYC'
      });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.kyc.status !== 'in_review') {
      return res.status(400).json({
        success: false,
        error: 'KYC is not in review status'
      });
    }

    // Update KYC status
    user.kyc.status = action === 'approve' ? 'approved' : 'rejected';
    user.kyc.reviewedAt = new Date();
    user.kyc.reviewedBy = req.user.id;
    
    if (action === 'reject') {
      user.kyc.rejectionReason = rejectionReason;
    } else {
      user.kyc.rejectionReason = undefined;
    }

    await user.save();

    // Send email notification
    try {
      await sendKYCStatusEmail(user, user.kyc.status, rejectionReason);
    } catch (emailError) {
      console.error('Failed to send KYC status email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: `KYC ${action}d successfully`,
      data: {
        status: user.kyc.status,
        reviewedAt: user.kyc.reviewedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get KYC statistics (Admin only)
// @route   GET /api/kyc/stats
// @access  Private/Admin
router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$kyc.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      in_review: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    // Get recent submissions
    const recentSubmissions = await User.find({
      'kyc.submittedAt': { $exists: true }
    })
    .select('email profile kyc.status kyc.submittedAt')
    .sort({ 'kyc.submittedAt': -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: {
        stats: formattedStats,
        recentSubmissions
      }
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware for file uploads
router.use(handleUploadError);

module.exports = router;

