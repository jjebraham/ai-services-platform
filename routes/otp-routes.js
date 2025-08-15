const express = require('express');
const router = express.Router();
const otpService = require('../services/otp-service');

// Start OTP verification process
router.post('/start', async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validation
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    const result = await otpService.requestOTP(phoneNumber);

    if (result.success) {
      res.json({
        success: true,
        message: 'OTP sent successfully',
        verificationId: result.verificationId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send OTP'
      });
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    // Log the request body for debugging
    console.log('OTP Verify Request Body:', req.body);
    
    const { phoneNumber, otp, phone, code } = req.body;

    // Support multiple parameter formats
    const finalPhoneNumber = phoneNumber || phone;
    const finalOtp = otp || code;

    // Validation
    if (!finalPhoneNumber || !finalOtp) {
      console.log('Missing parameters:', { finalPhoneNumber, finalOtp });
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    const result = await otpService.verifyOTP(finalPhoneNumber, finalOtp);

    if (result.success) {
      res.json({
        success: true,
        message: 'OTP verified successfully',
        user: result.user || null
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Invalid OTP'
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;