import express from 'express';
import authService from '../services/auth-service.js';
import supabaseConfig from '../supabase-config.js';
import otpService from '../services/otp-service.js';
import { createRequire } from 'module';

const router = express.Router();
const require = createRequire(import.meta.url);
const offlineAuth = process.env.OFFLINE_AUTH === '1' ? require('../offline-auth-service.js') : null;

// Register route with phone number and OTP verification
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password, verificationId } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !password || !verificationId) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required including phone verification'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Validate phone number format
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format'
      });
    }

    // Check if phone number is already verified (optional verification)
    const phoneVerified = await otpService.verifyOTP(phoneNumber, 'dummy');
    // Note: In a real implementation, you'd use the actual OTP from verificationId

    const fullName = `${firstName} ${lastName}`;
    const result = await authService.register({ 
      email, 
      password, 
      fullName,
      phoneNumber 
    });

    if (result.success) {
      // Update phone verification status
      await authService.updatePhoneVerification(result.user.id, true);
      
      res.status(201).json({
        ...result,
        user: {
          ...result.user,
          phoneNumber: phoneNumber,
          isPhoneVerified: true
        }
      });
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await authService.login(email, password);

    if (result.success) {
      // Set HTTP-only cookie with JWT token
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({
        success: true,
        message: result.message,
        user: result.user
      });
    } else {
      res.status(401).json(result);
    }

  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const result = await authService.logout();
    
    // Clear the token cookie
    res.clearCookie('token');
    
    res.json(result);

  } catch (error) {
    console.error('Logout route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    // This would typically use authentication middleware
    // For now, we'll get user ID from query params or token
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await authService.getUserProfile(userId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    console.error('Profile route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await authService.updateProfile(userId, updateData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Update profile route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Check authentication status
router.get('/status', async (req, res) => {
  try {
    const isConfigured = supabaseConfig.isConfigured();
    const connectionTest = await supabaseConfig.testConnection();

    res.json({
      success: true,
      supabaseConfigured: isConfigured,
      databaseConnection: connectionTest,
      message: isConfigured ? 'Authentication system ready' : 'Supabase not configured'
    });

  } catch (error) {
    console.error('Auth status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check authentication status'
    });
  }
});

// Phone authentication routes

// Send OTP to phone number
router.post('/send-otp', async (req, res) => {
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
        message: result.message,
        expiresIn: result.expiresIn
      });
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP'
    });
  }
});

// Verify OTP and login/register user
router.post('/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    // Validation
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required'
      });
    }

    // Verify OTP
    const otpResult = await otpService.verifyOTP(phoneNumber, otp);

    if (!otpResult.success) {
      return res.status(400).json(otpResult);
    }

    // OTP is valid, now check if user exists or create new user
    const normalizedPhone = otpService.normalizePhoneNumber(phoneNumber);
    // Choose auth service based on OFFLINE_AUTH flag
    const svc = offlineAuth || authService;

    try {
      // Try to find existing user by phone
      let user = await svc.findUserByPhone(normalizedPhone);
      if (!user) {
        // Create new user with phone number
        const userData = {
          phone: normalizedPhone,
          fullName: `User ${normalizedPhone.slice(-4)}`,
          isPhoneVerified: true
        };

        const createResult = await svc.createUserWithPhone(userData);

        if (!createResult.success) {
          return res.status(400).json(createResult);
        }

        user = createResult.user;
      } else {
        // Update phone verification status
        await svc.updatePhoneVerification(user.id, true);
      }

      // Generate JWT token
      const token = svc.generateToken(user.id);

      // Set HTTP-only cookie with JWT token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        message: 'Phone verification successful',
        user: {
          id: user.id,
          phone: user.phone,
          fullName: user.full_name || user.fullName || `User ${normalizedPhone.slice(-4)}`,
          isPhoneVerified: true
        }
      });

    } catch (dbError) {
      console.error('Database error during phone auth:', dbError);
      res.status(500).json({
        success: false,
        error: 'Database error during authentication'
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
});

export default router;
