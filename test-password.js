const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services')
  .then(async () => {
    const user = await User.findOne({email: 'demo@aiservices.com'}).select('+password');
    console.log('User found:', !!user);
    if(user) {
      console.log('Stored password hash:', user.password.substring(0, 20) + '...');
      const isMatch = await bcrypt.compare('demo123', user.password);
      console.log('Password match:', isMatch);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
