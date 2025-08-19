const supabaseConfig = require('../supabase-config.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

      // Handle password hashing for non-Google users (store hash in our table)
      if (!isGoogleUser && password) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      // Generate email verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      // Create user profile
      const profileData = {
        email,
        full_name: fullName,
        phone: phoneNumber || null,
        is_active: false, // User starts as inactive until email verification
        role: 'user',
        email_verified: false,
        verification_token: verificationToken,
        verification_code: verificationCode,
        verification_expiry: verificationExpiry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add Google-specific fields if it's a Google user
      if (isGoogleUser) {
        profileData.google_id = googleId;
        profileData.profile_picture = profilePicture;
        profileData.is_google_user = true;
      } else {
        profileData.password_hash = hashedPassword;
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select('id,email,full_name,phone,role,is_active,profile_picture')
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      // Send verification email (for non-Google users)
      if (!isGoogleUser) {
        try {
          await this.sendVerificationEmail(email, fullName, verificationCode, verificationToken);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          // Don't fail registration if email sending fails
        }
      }

      return { 
        success: true, 
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role,
          emailVerified: profile.email_verified || isGoogleUser
        },
        message: isGoogleUser ? 'Registration successful!' : 'Registration successful! Please check your email for verification.'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Send verification email
  async sendVerificationEmail(email, fullName, verificationCode, verificationToken) {
    try {
      const frontendBase = process.env.FRONTEND_URL || 'https://kiani.exchange';
      const verificationLink = `${frontendBase}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      const html = `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#222">
          <h2 style="margin:0 0 12px">Verify your email</h2>
          <p>Hello ${fullName || 'there'},</p>
          <p>Thank you for registering on <strong>KIANI.EXCHANGE</strong>. Please verify your email using the 6‑digit code below or click the link:</p>
          <div style="margin:18px 0;padding:14px 18px;border:1px dashed #888;display:inline-block;font-size:22px;letter-spacing:6px;font-weight:bold">${verificationCode}</div>
          <p><a href="${verificationLink}" style="color:#0d6efd">Verify via link</a> (expires in 24 hours)</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="font-size:12px;color:#666;margin:0">If you didn’t create an account, you can ignore this email.</p>
        </div>
      `;

      const subject = 'Verify your email - KIANI.EXCHANGE';

      // Prefer SendGrid if configured
      if (process.env.SENDGRID_API_KEY && (process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM)) {
        const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM;
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sgMail.send({
          to: email,
          from: fromEmail,
          subject,
          text: `Your verification code is ${verificationCode}. Or verify via: ${verificationLink}`,
          html
        });
        return { success: true };
      }

      // Fallback: log to server (so QA can copy-paste code) if no email provider is set
      console.warn('No email provider configured. Falling back to console log.');
      console.log('[DEV VERIFICATION]', { email, fullName, verificationCode, verificationLink });
      return { success: true, fallback: true };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: 'Failed to send verification email' };
    }
  }

  // Verify email with code
  async verifyEmail(email, code) {
    try {
      const supabase = supabaseConfig.getClient();
      
      // Find user with matching email and verification code
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('id, email, verification_code, verification_expiry, email_verified')
        .eq('email', email)
        .eq('verification_code', code)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid verification code' };
      }

      // Check if code is expired
      if (new Date() > new Date(user.verification_expiry)) {
        return { success: false, error: 'Verification code has expired' };
      }

      // Check if already verified
      if (user.email_verified) {
        return { success: false, error: 'Email is already verified' };
      }

      // Update user as verified
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email_verified: true,
          is_active: true,
          verification_code: null,
          verification_token: null,
          verification_expiry: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Email verification update error:', updateError);
        return { success: false, error: 'Failed to verify email' };
      }

      return { success: true, message: 'Email verified successfully!' };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Email verification failed' };
    }
  }

  // Verify email with token (for link-based verification)
  async verifyEmailToken(token) {
    try {
      const supabase = supabaseConfig.getClient();
      
      // Find user with matching verification token
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('id, email, verification_token, verification_expiry, email_verified, full_name')
        .eq('verification_token', token)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid verification link' };
      }

      // Check if token is expired
      if (new Date() > new Date(user.verification_expiry)) {
        return { success: false, error: 'Verification link has expired' };
      }

      // Check if already verified
      if (user.email_verified) {
        return { success: false, error: 'Email is already verified' };
      }

      // Update user as verified
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          email_verified: true,
          is_active: true,
          verification_code: null,
          verification_token: null,
          verification_expiry: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Email verification update error:', updateError);
        return { success: false, error: 'Failed to verify email' };
      }

      return { 
        success: true, 
        message: 'Email verified successfully!',
        user: {
          email: user.email,
          fullName: user.full_name
        }
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Email verification failed' };
    }
  }

  // Resend verification code
  async resendVerificationCode(email) {
    try {
      const supabase = supabaseConfig.getClient();
      
      // Find user
      const { data: user, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, email_verified')
        .eq('email', email)
        .single();

      if (error || !user) {
        return { success: false, error: 'User not found' };
      }

      if (user.email_verified) {
        return { success: false, error: 'Email is already verified' };
      }

      // Generate new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      // Update verification details
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          verification_code: verificationCode,
          verification_token: verificationToken,
          verification_expiry: verificationExpiry,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Resend verification update error:', updateError);
        return { success: false, error: 'Failed to generate new verification code' };
      }

      // Send new verification email
      try {
        await this.sendVerificationEmail(user.email, user.full_name, verificationCode, verificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return { success: false, error: 'Failed to send verification email' };
      }

      return { success: true, message: 'Verification code sent successfully!' };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Failed to resend verification code' };
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
        .select('id,email,full_name,phone,role,password_hash,is_active,profile_picture,email_verified')
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

      // Check if email is verified
      if (!profile.email_verified) {
        return { 
          success: false, 
          error: 'Please verify your email address before logging in',
          needsVerification: true,
          email: profile.email
        };
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
        .select('email')
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
      // If you later add auth_user_id, update Supabase Auth here

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

  // Google login/signup
  async googleLogin(googleData) {
    try {
      const { googleId, email, fullName, picture } = googleData;

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

      // Check if user exists
      let { data: existingUser, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking existing user:', userError);
        return { success: false, error: 'Failed to check existing user' };
      }

      let user;
      if (!existingUser) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('user_profiles')
          .insert([{
            email,
            full_name: fullName,
            google_id: googleId,
            profile_picture: picture,
            is_google_user: true,
            is_active: true,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user:', createError);
          return { success: false, error: 'Failed to create user account' };
        }

        user = newUser;
      } else {
        // Update existing user's Google info and last login
        const { data: updatedUser, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            google_id: googleId,
            profile_picture: picture || existingUser.profile_picture,
            is_google_user: true,
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user:', updateError);
          return { success: false, error: 'Failed to update user account' };
        }

        user = updatedUser;
      }

      // Generate JWT token
      const token = this.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          profilePicture: user.profile_picture,
          isGoogleUser: true
        }
      };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Google authentication failed' };
    }
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

module.exports = new AuthService();
