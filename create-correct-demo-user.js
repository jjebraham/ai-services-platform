const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model schema (simplified version)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    phone: String
  },
  emailVerified: { type: Boolean, default: true },
  accountStatus: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createCorrectDemoUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services-platform');
    console.log('Connected to MongoDB');

    const demoUserData = {
      email: 'demo@example.com',
      password: 'demo123',
      role: 'user',
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        phone: '+1234567890'
      },
      emailVerified: true,
      accountStatus: 'active'
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: demoUserData.email });
    
    if (existingUser) {
      console.log(`User ${demoUserData.email} already exists, updating password...`);
      // Hash new password
      const hashedPassword = await bcrypt.hash(demoUserData.password, 12);
      await User.findOneAndUpdate(
        { email: demoUserData.email },
        { 
          password: hashedPassword,
          role: demoUserData.role,
          profile: demoUserData.profile,
          emailVerified: demoUserData.emailVerified,
          accountStatus: demoUserData.accountStatus,
          updatedAt: new Date()
        }
      );
      console.log(`✅ Updated user: ${demoUserData.email}`);
    } else {
      console.log(`Creating new user: ${demoUserData.email}`);
      // Hash password
      const hashedPassword = await bcrypt.hash(demoUserData.password, 12);
      
      const newUser = new User({
        email: demoUserData.email,
        password: hashedPassword,
        role: demoUserData.role,
        profile: demoUserData.profile,
        emailVerified: demoUserData.emailVerified,
        accountStatus: demoUserData.accountStatus
      });
      
      await newUser.save();
      console.log(`✅ Created user: ${demoUserData.email}`);
    }

    console.log('\n🎉 Demo user created/updated successfully!');
    console.log('📋 Demo Credentials:');
    console.log('==================');
    console.log(`Email: ${demoUserData.email}`);
    console.log(`Password: ${demoUserData.password}`);
    console.log('==================');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📤 Database connection closed.');
  }
}

createCorrectDemoUser();
