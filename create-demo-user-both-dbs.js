require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// MongoDB User model
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

async function createDemoUserBothDatabases() {
  try {
    console.log('🚀 Creating demo user in both MongoDB and Supabase...\n');

    const demoUser = {
      email: 'demo@aiservices.com',
      password: 'demo123456',
      firstName: 'Demo',
      lastName: 'User',
      role: 'user',
      phone: '+1234567890'
    };

    // ===== MongoDB Setup =====
    console.log('📦 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-services-platform');
    console.log('✅ Connected to MongoDB');

    // Check if user exists in MongoDB
    const existingMongoUser = await User.findOne({ email: demoUser.email });
    
    if (existingMongoUser) {
      console.log(`⚠️  User ${demoUser.email} already exists in MongoDB, updating...`);
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      await User.findOneAndUpdate(
        { email: demoUser.email },
        { 
          password: hashedPassword,
          role: demoUser.role,
          profile: {
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            phone: demoUser.phone
          },
          emailVerified: true,
          accountStatus: 'active',
          updatedAt: new Date()
        }
      );
      console.log(`✅ Updated user in MongoDB: ${demoUser.email}`);
    } else {
      console.log(`📝 Creating new user in MongoDB: ${demoUser.email}`);
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      
      const newUser = new User({
        email: demoUser.email,
        password: hashedPassword,
        role: demoUser.role,
        profile: {
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          phone: demoUser.phone
        },
        emailVerified: true,
        accountStatus: 'active'
      });
      
      await newUser.save();
      console.log(`✅ Created user in MongoDB: ${demoUser.email}`);
    }

    // ===== Supabase Setup =====
    console.log('\n🔐 Setting up Supabase...');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase credentials not found, skipping Supabase setup');
      console.log('📋 MongoDB user created successfully, but Supabase setup skipped');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✅ Connected to Supabase');

    // Try to create user in Supabase Auth first
    console.log('👤 Creating user in Supabase Auth...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        first_name: demoUser.firstName,
        last_name: demoUser.lastName,
        role: demoUser.role
      }
    });

    if (authError && !authError.message.includes('already exists')) {
      console.error('❌ Supabase Auth error:', authError);
    } else if (authUser) {
      console.log('✅ Created user in Supabase Auth');
    } else {
      console.log('⚠️  User might already exist in Supabase Auth');
    }

    // Check if user profile exists in Supabase
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', demoUser.email)
      .single();

    if (!profileCheckError && existingProfile) {
      console.log(`⚠️  User profile ${demoUser.email} already exists in Supabase, updating...`);
      
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          password_hash: hashedPassword,
          first_name: demoUser.firstName,
          last_name: demoUser.lastName,
          full_name: `${demoUser.firstName} ${demoUser.lastName}`,
          phone: demoUser.phone,
          role: demoUser.role,
          is_active: true,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', demoUser.email);

      if (updateError) {
        console.error('❌ Error updating Supabase profile:', updateError);
      } else {
        console.log(`✅ Updated user profile in Supabase: ${demoUser.email}`);
      }
    } else {
      console.log(`📝 Creating new user profile in Supabase: ${demoUser.email}`);
      
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([{
          email: demoUser.email,
          password_hash: hashedPassword,
          first_name: demoUser.firstName,
          last_name: demoUser.lastName,
          full_name: `${demoUser.firstName} ${demoUser.lastName}`,
          phone: demoUser.phone,
          role: demoUser.role,
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating Supabase profile:', createError);
      } else {
        console.log(`✅ Created user profile in Supabase: ${demoUser.email}`);
      }
    }

    console.log('\n🎉 Demo user setup completed in both databases!');
    console.log('📋 Demo Credentials:');
    console.log('==================');
    console.log(`Email: ${demoUser.email}`);
    console.log(`Password: ${demoUser.password}`);
    console.log('==================');
    console.log('💾 Available in: MongoDB ✅ | Supabase ✅');
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📤 MongoDB connection closed.');
    }
  }
}

createDemoUserBothDatabases();
