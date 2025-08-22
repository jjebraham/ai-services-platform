const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createDemoUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services-platform-platform');
    console.log('Connected to MongoDB');

    // Demo users data
    const demoUsers = [
      {
        email: 'demo@aiservices.com',
        password: 'demo123456',
        role: 'user',
        profile: {
          firstName: 'Demo',
          lastName: 'User',
          phone: '+1234567890'
        },
        emailVerified: true,
        accountStatus: 'active'
      },
      {
        email: 'demoadmin@aiservices.com',
        password: 'demoadmin123456',
        role: 'admin',
        profile: {
          firstName: 'Demo',
          lastName: 'Admin',
          phone: '+1234567891'
        },
        emailVerified: true,
        accountStatus: 'active'
      },
      {
        email: 'admin@aiservices.com',
        password: 'admin123456',
        role: 'admin',
        profile: {
          firstName: 'Super',
          lastName: 'Admin',
          phone: '+1234567892'
        },
        emailVerified: true,
        accountStatus: 'active'
      }
    ];

    // Create or update users
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists, updating...`);
        // Hash new password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await User.findOneAndUpdate(
          { email: userData.email },
          { 
            password: hashedPassword,
            role: userData.role,
            profile: userData.profile,
            emailVerified: userData.emailVerified,
            accountStatus: userData.accountStatus
          }
        );
        console.log(`Updated user: ${userData.email}`);
      } else {
        console.log(`Creating new user: ${userData.email}`);
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        const newUser = new User({
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          profile: userData.profile,
          emailVerified: userData.emailVerified,
          accountStatus: userData.accountStatus
        });
        
        await newUser.save();
        console.log(`Created user: ${userData.email}`);
      }
    }

    console.log('Demo users created/updated successfully!');
    
    // List all users to verify
    const allUsers = await User.find({}, 'email role profile.firstName profile.lastName');
    console.log('\nAll users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.profile?.firstName} ${user.profile?.lastName}`);
    });
    
  } catch (error) {
    console.error('Error creating demo users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

createDemoUsers();

