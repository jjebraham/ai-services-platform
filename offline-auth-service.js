const jwt = require('jsonwebtoken');

class OfflineAuthService {
  constructor() {
    // In-memory user storage for offline mode
    this.users = new Map();
    this.nextUserId = 1;
  }

  // Find user by phone number
  async findUserByPhone(phoneNumber) {
    try {
      for (const [id, user] of this.users) {
        if (user.phone === phoneNumber && user.is_active) {
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('Find user by phone error:', error);
      return null;
    }
  }

  // Create user with phone number
  async createUserWithPhone(userData) {
    try {
      const userId = this.nextUserId++;
      const uniqueEmail = `${userData.phone}@phone.kiani.exchange`;

      const user = {
        id: userId,
        email: uniqueEmail,
        phone: userData.phone,
        full_name: userData.fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        is_phone_verified: userData.isPhoneVerified || false,
        role: 'user'
      };

      this.users.set(userId, user);

      return {
        success: true,
        message: 'User created successfully',
        user: user
      };

    } catch (error) {
      console.error('Create user with phone error:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Update phone verification status
  async updatePhoneVerification(userId, isVerified) {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      user.is_phone_verified = isVerified;
      user.updated_at = new Date().toISOString();

      return { success: true, message: 'Phone verification status updated' };

    } catch (error) {
      console.error('Update phone verification error:', error);
      return { success: false, error: 'Failed to update phone verification' };
    }
  }

  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );
  }

  // Get user count for testing
  getUserCount() {
    return this.users.size;
  }

  // Get all users for testing
  getAllUsers() {
    return Array.from(this.users.values());
  }
}

module.exports = new OfflineAuthService();