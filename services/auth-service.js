const supabaseConfig = require('../supabase-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  constructor() {
    // Don't store clients in constructor - get them dynamically
  }

  // Register new user
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
}

module.exports = new AuthService();