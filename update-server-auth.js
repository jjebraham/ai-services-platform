const fs = require('fs');
const path = require('path');

// Read the updated auth-service.js content
const authServiceContent = `const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseConfig } = require('./supabase-config');

class AuthService {
  constructor() {
    this.supabase = supabaseConfig.supabase;
    this.supabaseAdmin = supabaseConfig.supabaseAdmin;
  }

  async checkDatabaseConnection() {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  async register(email, password, fullName, phone = null) {
    try {
      // Check database connection
      const dbConnected = await this.checkDatabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user in Supabase Auth with email verification required
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: \`\${process.env.FRONTEND_URL || 'http://localhost:3000'}/login\`
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw new Error(authError.message);
      }

      // Create user profile in database
      const { data: profileData, error: profileError } = await this.supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone,
          password_hash: hashedPassword,
          role: 'user',
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Clean up auth user if profile creation fails
        await this.supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error('Failed to create user profile');
      }

      return {
        success: true,
        user: {
          id: profileData.id,
          email: profileData.email,
          name: profileData.full_name,
          role: profileData.role
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Check database connection
      const dbConnected = await this.checkDatabaseConnection();
      if (!dbConnected) {
        throw new Error('Database connection failed');
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !userProfile) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userProfile.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Auth sign-in error:', authError);
        throw new Error('Authentication failed');
      }

      // Check if email is verified
      if (!authData.user.email_confirmed_at) {
        // Sign out the user since email is not verified
        await this.supabase.auth.signOut();
        const error = new Error('Please verify your email address before logging in. Check your inbox for a verification link.');
        error.requiresEmailVerification = true;
        throw error;
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: userProfile.id, 
          email: userProfile.email,
          role: userProfile.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Update last login
      await this.supabase
        .from('user_profiles')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      return {
        success: true,
        token,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.full_name,
          phone: userProfile.phone,
          role: userProfile.role,
          balance: userProfile.balance
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message,
        requiresEmailVerification: error.requiresEmailVerification || false
      };
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get fresh user data
      const { data: userProfile, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !userProfile) {
        throw new Error('User not found');
      }

      return {
        success: true,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.full_name,
          phone: userProfile.phone,
          role: userProfile.role,
          balance: userProfile.balance
        }
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  }

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        user: {
          id: data.id,
          email: data.email,
          name: data.full_name,
          phone: data.phone,
          role: data.role,
          balance: data.balance
        }
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current user
      const { data: userProfile, error: profileError } = await this.supabase
        .from('user_profiles')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (profileError || !userProfile) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, userProfile.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password in database
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({
          password_hash: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteAccount(userId) {
    try {
      // Delete from user_profiles table
      const { error: profileError } = await this.supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Delete from Supabase Auth
      const { error: authError } = await this.supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Auth deletion error:', authError);
        // Don't throw here as profile is already deleted
      }

      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AuthService();`;

console.log('Updated auth-service.js content ready for deployment');
console.log('Content length:', authServiceContent.length);