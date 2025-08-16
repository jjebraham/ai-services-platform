import supabaseConfig from '../supabase-config.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  constructor() {
    // Don't store clients in constructor - get them dynamically
  }

  // Register new user
  async register(userData) {
    const { email, password, fullName, phoneNumber, googleId, profilePicture, isGoogleUser } = userData;

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
          return { success: false, error: 'User already exists with this phone number' };
        }
      }

      let hashedPassword = null;
      let authUser = null;

      // Handle password hashing and Supabase auth for non-Google users
      if (!isGoogleUser && password) {
        // Hash password
        hashedPassword = await bcrypt.hash(password, 12);

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true
        });

        if (authError) {
          console.error('Supabase auth error:', authError);
          return { success: false, error: 'Failed to create user account' };
        }

        authUser = authData.user;
      }

      // Create user profile
      const profileData = {
        email,
        full_name: fullName,
        phone: phoneNumber || null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add Google-specific fields if it's a Google user
      if (isGoogleUser) {
        profileData.google_id = googleId;
        profileData.profile_picture = profilePicture;
        profileData.is_google_user = true;
      } else {
        profileData.auth_user_id = authUser?.id;
        profileData.password_hash = hashedPassword;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        
        // If profile creation fails and we created an auth user, clean up
        if (authUser) {
          await adminSupabase.auth.admin.deleteUser(authUser.id);
        }
        
        return { success: false, error: 'Failed to create user profile' };
      }

      return { 
        success: true, 
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Check if Supabase is configured
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

      // Get user profile directly from our table
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError);
        return { success: false, error: 'Invalid email or password' };
      }

      // Check if user is active
      if (!profile.is_active) {
        return { success: false, error: 'Account is deactivated' };
      }

      // Verify password using our stored hash
      if (!profile.password_hash) {
        return { success: false, error: 'Invalid email or password' };
      }

      const passwordValid = await bcrypt.compare(password, profile.password_hash);
      if (!passwordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update last login time
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', profile.id);

      // Generate JWT token
      const token = this.generateToken({
        id: profile.id,
        email: profile.email,
        role: profile.role
      });

      return {
        success: true,
        token,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          profilePicture: profile.profile_picture
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
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
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Profile fetch error:', error);
        return { success: false, error: 'User profile not found' };
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          profilePicture: profile.profile_picture,
          isGoogleUser: profile.is_google_user
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

      const allowedFields = ['full_name', 'phone', 'profile_picture'];
      const filteredData = {};
      
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      filteredData.updated_at = new Date().toISOString();

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update(filteredData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        return { success: false, error: 'Failed to update profile' };
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          profilePicture: profile.profile_picture
        }
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Change password
  async changePassword(userId, currentPassword, newPassword) {
    try {
      if (!supabaseConfig.isConfigured()) {
        return { 
          success: false, 
          error: 'Database not configured. Please contact administrator.' 
        };
      }

      const supabase = supabaseConfig.getClient();
      const adminSupabase = supabaseConfig.getAdminClient();
      
      if (!supabase || !adminSupabase) {
        return { 
          success: false, 
          error: 'Database connection not available. Please contact administrator.' 
        };
      }

      // Get user profile to get email
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email, auth_user_id')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return { success: false, error: 'User not found' };
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword
      });

      if (verifyError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password in Supabase Auth
      if (profile.auth_user_id) {
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
          profile.auth_user_id,
          { password: newPassword }
        );

        if (updateError) {
          console.error('Password update error:', updateError);
          return { success: false, error: 'Failed to update password' };
        }
      }

      // Hash and store new password in user_profiles
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .update({ 
          password_hash: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileUpdateError) {
        console.error('Profile password update error:', profileUpdateError);
        return { success: false, error: 'Failed to update password' };
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
      return { success: true, user: decoded };
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: 'Invalid token' };
    }
  }

  // Update phone verification status
  async updatePhoneVerificationStatus(userId, isVerified) {
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

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          phone_verified: isVerified,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Phone verification update error:', error);
        return { success: false, error: 'Failed to update phone verification status' };
      }

      return { success: true, user: data };
    } catch (error) {
      console.error('Update phone verification error:', error);
      return { success: false, error: 'Failed to update phone verification status' };
    }
  }

  // Find user by email
  async findUserByEmail(email) {
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

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !profile) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          profilePicture: profile.profile_picture,
          isGoogleUser: profile.is_google_user,
          googleId: profile.google_id
        }
      };
    } catch (error) {
      console.error('Find user by email error:', error);
      return { success: false, error: 'Failed to find user' };
    }
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(
      { 
        id: payload.id, 
        email: payload.email, 
        role: payload.role 
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
  }

  // Logout user
  async logout() {
    try {
      const supabase = supabaseConfig.getClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }
}

export default new AuthService();
