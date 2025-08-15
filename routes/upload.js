const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Upload route - to be implemented'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

