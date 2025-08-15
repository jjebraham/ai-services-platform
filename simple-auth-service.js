import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleAuthService {
  constructor() {
    this.usersFile = path.join(__dirname, 'users.json');
    this.initializeUsersFile();
  }

  async initializeUsersFile() {
    try {
      await fs.promises.access(this.usersFile);
    } catch (error) {
      // File doesn't exist, create it
      await fs.promises.writeFile(this.usersFile, JSON.stringify([], null, 2));
    }
  }

  async loadUsers() {
    try {
      const data = await fs.promises.readFile(this.usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveUsers(users) {
    await fs.promises.writeFile(this.usersFile, JSON.stringify([], null, 2));
  }

  // Register new user
  async register(userData) {
    const { email, password, fullName } = userData;

    try {
      const users = await this.loadUsers();

      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' };
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        email,
        full_name: fullName,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        role: 'user',
        last_login: null
      };

      users.push(newUser);
      await this.saveUsers(users);

      return {
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role
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
      const users = await this.loadUsers();

      // Find user
      const user = users.find(u => u.email === email && u.is_active);
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
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

      // Update last login
      user.last_login = new Date().toISOString();
      await this.saveUsers(users);

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role
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
      const users = await this.loadUsers();
      const user = users.find(u => u.id === userId);

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          createdAt: user.created_at,
          lastLogin: user.last_login
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
      const users = await this.loadUsers();
      const userIndex = users.findIndex(u => u.id === userId);

      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      // Update allowed fields
      const allowedFields = ['full_name'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          users[userIndex][field] = updateData[field];
        }
      });

      users[userIndex].updated_at = new Date().toISOString();
      await this.saveUsers(users);

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: users[userIndex].id,
          email: users[userIndex].email,
          fullName: users[userIndex].full_name,
          role: users[userIndex].role
        }
      };

    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Logout (simple implementation)
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }
}

export default new SimpleAuthService();