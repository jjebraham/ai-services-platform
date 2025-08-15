const supabaseConfig = require('../supabase-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    // Don't store clients in constructor - get them dynamically
  }

  // Register new user
  async register(userData) {
    const { email, password, fullName, googleId, profilePicture, isGoogleUser } = userData;

    try {
      // Check if Supabase is configured
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      // Get clients dynamically
      const supabase = supabaseConfig.getClient();
      const adminSupabase = supabaseConfig.getAdminClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      let hashedPassword = null;
      let authData = null;

      // Handle Google OAuth users differently
      if (isGoogleUser) {
        // For Google users, create a dummy auth entry or skip Supabase Auth
        authData = { user: { id: googleId || `google_${Date.now()}` } };
      } else {
        // Hash password for regular users
        const saltRounds = 12;
        hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in Supabase Auth
        const { data: authResult, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (authError) {
          return { success: false, error: authError.message };
        }
        authData = authResult;
      }

      // Create user profile
      const profileInsert = {
        id: authData.user.id,
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        role: 'user'
      };

      // Add password hash for non-Google users
      if (!isGoogleUser && hashedPassword) {
        profileInsert.password_hash = hashedPassword;
      }

      // Add Google-specific fields
      if (isGoogleUser) {
        profileInsert.google_id = googleId;
        profileInsert.profile_picture = profilePicture;
        profileInsert.is_google_user = true;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileInsert])
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        if (adminSupabase) {
          await adminSupabase.auth.admin.deleteUser(authData.user.id);
        }
        return { success: false, error: profileError.message };
      }

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          role: profileData.role
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

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (profileError || !userProfile) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userProfile.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: userProfile.id, 
          email: userProfile.email,
          role: userProfile.role 
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userProfile.id);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.full_name,
          role: userProfile.role
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, created_at, last_login, is_active')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: userProfile
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

  // Google OAuth login
  async googleLogin(googleData) {
    const { googleId, email, fullName, picture } = googleData;

    try {
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      const supabase = supabaseConfig.getClient();
      const adminSupabase = supabaseConfig.getAdminClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Check if user already exists
      const { data: existingUser, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      let user;

      if (existingUser) {
        // Update existing user with Google ID if not set
        if (!existingUser.google_id) {
          const { data: updatedUser, error: updateError } = await supabase
            .from('user_profiles')
            .update({
              google_id: googleId,
              profile_picture: picture,
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)
            .select()
            .single();

          if (updateError) {
            return { success: false, error: updateError.message };
          }
          user = updatedUser;
        } else {
          // Just update last login
          const { data: updatedUser, error: updateError } = await supabase
            .from('user_profiles')
            .update({
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', existingUser.id)
            .select()
            .single();

          if (updateError) {
            return { success: false, error: updateError.message };
          }
          user = updatedUser;
        }
      } else {
        // Create new user
        const userId = `google_${googleId}_${Date.now()}`;

        // Create user profile
        const { data: newUser, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: userId,
              email,
              full_name: fullName,
              google_id: googleId,
              profile_picture: picture,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_active: true,
              role: 'user',
              password_hash: null // No password for Google OAuth users
            }
          ])
          .select()
          .single();

        if (createError) {
          return { success: false, error: createError.message };
        }
        user = newUser;
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        message: existingUser ? 'Login successful' : 'Account created and logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          profilePicture: user.profile_picture
        }
      };

    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google authentication failed. Please try again.' };
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
=======
import supabaseConfig from '../supabase-config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  constructor() {
    // Don't store clients in constructor - get them dynamically
  }

  // Register new user
  async register(userData) {
    const { email, password, fullName, phoneNumber } = userData;

    try {
      // Check if Supabase is configured
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      // Get clients dynamically
      const supabase = supabaseConfig.getClient();
      const adminSupabase = supabaseConfig.getAdminClient();

      if (!supabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Check if user already exists by email
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Check if phone number already exists
      if (phoneNumber) {
        const { data: existingPhone } = await supabase
          .from('user_profiles')
          .select('phone')
          .eq('phone', phoneNumber)
          .single();

        if (existingPhone) {
          return { success: false, error: 'Phone number already registered' };
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: fullName,
            phone: phoneNumber,
            is_phone_verified: true,
            password_hash: hashedPassword,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (profileError) {
        // Clean up auth user if profile creation fails
        if (adminSupabase) {
          await adminSupabase.auth.admin.deleteUser(authData.user.id);
        }
        return { success: false, error: profileError.message };
      }

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: profileData.id,
          email: profileData.email,
          fullName: profileData.full_name,
          phoneNumber: profileData.phone,
          isPhoneVerified: profileData.is_phone_verified,
          role: profileData.role
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

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (profileError || !userProfile) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userProfile.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: userProfile.id, 
          email: userProfile.email,
          role: userProfile.role 
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userProfile.id);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.full_name,
          role: userProfile.role
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // Get user profile
  async getUserProfile(userId) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, created_at, last_login, is_active')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: userProfile
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

  // Phone authentication methods

  // Find user by phone number
  async findUserByPhone(phoneNumber) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return null;
      }

      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone', phoneNumber)
        .eq('is_active', true)
        .single();

      if (error || !userProfile) {
        return null;
      }

      return userProfile;

    } catch (error) {
      console.error('Find user by phone error:', error);
      return null;
    }
  }

  // Create user with phone number
  async createUserWithPhone(userData) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      // Generate a unique email for phone-only users
      const uniqueEmail = `${userData.phone}@phone.kiani.exchange`;

      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            email: uniqueEmail,
            phone: userData.phone,
            full_name: userData.fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            is_phone_verified: userData.isPhoneVerified || false,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return {
        success: true,
        message: 'User created successfully',
        user: profileData
      };

    } catch (error) {
      console.error('Create user with phone error:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Update phone verification status
  async updatePhoneVerification(userId, isVerified) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          is_phone_verified: isVerified,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Phone verification status updated' };

    } catch (error) {
      console.error('Update phone verification error:', error);
      return { success: false, error: 'Failed to update phone verification' };
    }
  }

  // Find user by email
  async findUserByEmail(email) {
    try {
      const supabase = supabaseConfig.getClient();

      if (!supabase) {
        return { success: false, error: 'Database connection not available' };
      }

      const { data: userProfile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        user: {
          id: userProfile.id,
          email: userProfile.email,
          fullName: userProfile.full_name,
          role: userProfile.role,
          isGoogleUser: userProfile.is_google_user || false
        }
      };

    } catch (error) {
      console.error('Find user by email error:', error);
      return { success: false, error: 'Failed to find user' };
    }
  }

  // Generate JWT token
  async generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
  }
}

module.exports = new AuthService();
