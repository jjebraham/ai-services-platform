const express = require('express');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/pages', optionalAuth, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'CMS route - to be implemented'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

