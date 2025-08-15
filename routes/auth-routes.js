const express = require('express');
const router = express.Router();
const authService = require('../services/auth-service');
const supabaseConfig = require('../supabase-config');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
);

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and full name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    const result = await authService.register({ email, password, fullName });

    if (result.success) {
      res.status(201).json(result);
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

// Google OAuth login route
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email not provided by Google'
      });
    }

    const result = await authService.googleLogin({
      googleId,
      email,
      fullName: name,
      picture
    });

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
      res.status(400).json(result);
    }

  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
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

module.exports = router;