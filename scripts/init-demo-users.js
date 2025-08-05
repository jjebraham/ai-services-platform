#!/usr/bin/env node

/**
 * Demo Users Initialization Script
 * This script creates demo users for testing the dashboard and internal pages
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../User');

// Demo users configuration
const demoUsers = [
  {
    email: process.env.DEMO_USER_EMAIL || 'demo@aiservices.com',
    password: process.env.DEMO_USER_PASSWORD || 'demo123456',
    role: 'user',
    profile: {
      firstName: 'Demo',
      lastName: 'User',
      phone: '+1234567890'
    },
    emailVerified: true,
    accountStatus: 'active',
    kyc: {
      status: 'approved',
      submittedAt: new Date(),
      reviewedAt: new Date()
    }
  },
  {
    email: process.env.DEMO_ADMIN_EMAIL || 'demoadmin@aiservices.com',
    password: process.env.DEMO_ADMIN_PASSWORD || 'demoadmin123456',
    role: 'admin',
    profile: {
      firstName: 'Demo',
      lastName: 'Admin',
      phone: '+1234567891'
    },
    emailVerified: true,
    accountStatus: 'active',
    kyc: {
      status: 'approved',
      submittedAt: new Date(),
      reviewedAt: new Date()
    }
  },
  {
    email: process.env.ADMIN_EMAIL || 'admin@aiservices.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
    role: 'admin',
    profile: {
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567892'
    },
    emailVerified: true,
    accountStatus: 'active',
    kyc: {
      status: 'approved',
      submittedAt: new Date(),
      reviewedAt: new Date()
    }
  }
];

async function initDemoUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services-platform';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n🚀 Initializing demo users...\n');

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create new user
        const user = new User(userData);
        await user.save();
        
        console.log(`✅ Created ${userData.role} user: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Name: ${userData.profile.firstName} ${userData.profile.lastName}`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('🎉 Demo users initialization completed!\n');
    
    console.log('📋 Demo Credentials Summary:');
    console.log('================================');
    demoUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()} - ${user.email} : ${user.password}`);
    });
    console.log('================================\n');
    
    console.log('🔗 You can now login to:');
    console.log(`   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`   Backend: http://localhost:${process.env.PORT || 5000}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error initializing demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  initDemoUsers();
}

module.exports = { initDemoUsers, demoUsers };