require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
const User = require('./User');

const manualSync = async () => {
  try {
    console.log('Starting manual sync...');
    
    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase initialized');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services-platform');
    console.log('MongoDB connected');
    
    // Check if user exists in Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError.message);
      return;
    }
    
    const targetUser = authUsers.users.find(u => u.email === 'kianirad2020@gmail.com');
    console.log('Supabase Auth User:', targetUser ? {
      id: targetUser.id,
      email: targetUser.email,
      email_confirmed_at: targetUser.email_confirmed_at,
      user_metadata: targetUser.user_metadata
    } : 'Not found');
    
    if (targetUser) {
      // Check if user exists in MongoDB
      let mongoUser = await User.findOne({ email: targetUser.email });
      console.log('MongoDB User before sync:', mongoUser ? 'Found' : 'Not found');
      
      if (!mongoUser) {
        // Create user in MongoDB
        const userData = {
          email: targetUser.email,
          password: 'supabase_managed', // Placeholder since auth is handled by Supabase
          role: 'user',
          profile: {
            firstName: targetUser.user_metadata?.full_name?.split(' ')[0] || 'Unknown',
            lastName: targetUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ''
          },
          accountStatus: 'active',
          emailVerified: !!targetUser.email_confirmed_at,
          supabaseId: targetUser.id
        };
        
        mongoUser = new User(userData);
        await mongoUser.save();
        console.log('User created in MongoDB:', {
          email: mongoUser.email,
          firstName: mongoUser.profile?.firstName,
          lastName: mongoUser.profile?.lastName,
          emailVerified: mongoUser.emailVerified,
          supabaseId: mongoUser.supabaseId
        });
      } else {
        console.log('User already exists in MongoDB');
      }
    }
    
    // Final verification
    const finalMongoUser = await User.findOne({ email: 'kianirad2020@gmail.com' });
    console.log('Final MongoDB User:', finalMongoUser ? {
      email: finalMongoUser.email,
      firstName: finalMongoUser.profile?.firstName,
      lastName: finalMongoUser.profile?.lastName,
      emailVerified: finalMongoUser.emailVerified,
      supabaseId: finalMongoUser.supabaseId,
      createdAt: finalMongoUser.createdAt
    } : 'Not found');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in manual sync:', error.message);
    process.exit(1);
  }
};

manualSync();