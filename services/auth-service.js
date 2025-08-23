const supabaseConfig = require('../supabase-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    // Don't store clients in constructor - get them dynamically
  }

  // Register new user with email verification
  async register(userData) {
    const { email, password, fullName } = userData;

    try {
      // Check if Supabase is configured
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      // Get client dynamically
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Register user with Supabase Auth (includes email verification)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, error: 'User already exists with this email' };
        }
        return { success: false, error: authError.message };
      }

      // Check if email confirmation is required
      if (authData.user && !authData.user.email_confirmed_at) {
        return {
          success: true,
          message: 'Registration successful! Please check your email to verify your account.',
          requiresVerification: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            fullName: fullName
          }
        };
      }

      // If email is already confirmed (shouldn't happen in normal flow)
      return {
        success: true,
        message: 'Registration successful!',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: fullName
        }
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  // Login user
  async login(email, password) {
    try {
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      // Get client dynamically
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please verify your email address before logging in. Check your inbox for a verification link.',
            requiresVerification: true
          };
        }
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if email is verified
      if (!authData.user.email_confirmed_at) {
        return {
          success: false,
          error: 'Please verify your email address before logging in. Check your inbox for a verification link.',
          requiresVerification: true
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: authData.user.id, 
          email: authData.user.email,
          role: 'user' // Default role, can be customized
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName: authData.user.user_metadata?.full_name || authData.user.email.split('@')[0],
          role: 'user'
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Verify email with token
  async verifyEmail(token) {
    try {
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Verify the email using the token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Email verified successfully! You can now log in.',
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
        }
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Email verification failed. Please try again.' };
    }
  }

  // In-memory store for tracking resend attempts (in production, use Redis or database)
  static resendAttempts = new Map();

  // Resend verification email
  async resendVerification(email) {
    try {
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Check rate limiting (10 minutes = 600,000 milliseconds)
      const now = Date.now();
      const lastAttempt = AuthService.resendAttempts.get(email);
      const cooldownPeriod = 10 * 60 * 1000; // 10 minutes in milliseconds

      if (lastAttempt && (now - lastAttempt) < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - (now - lastAttempt)) / 60000); // Convert to minutes
        return {
          success: false,
          error: `Please wait ${remainingTime} minute(s) before requesting another verification email.`
        };
      }

      // Resend verification email
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Record the successful resend attempt
      AuthService.resendAttempts.set(email, now);

      // Clean up old entries (older than 24 hours) to prevent memory leaks
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      for (const [emailKey, timestamp] of AuthService.resendAttempts.entries()) {
        if (timestamp < oneDayAgo) {
          AuthService.resendAttempts.delete(emailKey);
        }
      }

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Failed to resend verification email. Please try again.' };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Get current user from Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return { success: false, error: 'User not found or not authenticated.' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email.split('@')[0],
          role: 'user',
          createdAt: user.created_at,
          emailVerified: !!user.email_confirmed_at
        }
      };

    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Profile updated successfully',
        user: updatedProfile
      };

    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Logout user
  async logout() {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }
}

module.exports = new AuthService();