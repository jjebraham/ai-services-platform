const mongoose = require('mongoose');
const User = require('./User');

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services-platform');
    const user = await User.findOne({email: 'kianirad2020@gmail.com'});
    console.log('MongoDB User:', user ? {
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    } : 'Not found');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkUser();