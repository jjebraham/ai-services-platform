const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Users route - to be implemented'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

