#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import supabaseConfig from './supabase-config.js';

async function createDemoUser() {
  try {
    console.log('🚀 Creating demo user for jjebraham@gmail.com...\n');

    // Initialize Supabase
    const initialized = supabaseConfig.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize Supabase');
      process.exit(1);
    }

    const supabase = supabaseConfig.getClient();
    if (!supabase) {
      console.error('❌ Supabase client not available');
      process.exit(1);
    }

    console.log('✅ Connected to Supabase\n');

    const demoUser = {
      email: 'jjebraham@gmail.com',
      password: 'demo123',
      fullName: 'J. J. Ebraham',
      role: 'admin' // Making you an admin
    };

    console.log(`Creating admin user: ${demoUser.email}...`);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('email', demoUser.email)
      .single();

    if (existingUser) {
      console.log(`⚠️  User ${demoUser.email} already exists!`);
      console.log(`   Current role: ${existingUser.role}`);
      
      // Update the existing user to make sure they're admin with correct password
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: demoUser.fullName,
          password_hash: hashedPassword,
          role: demoUser.role,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', demoUser.email)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Error updating user: ${updateError.message}`);
      } else {
        console.log(`✅ Updated existing user to admin role`);
        console.log(`   Email: ${demoUser.email}`);
        console.log(`   Password: ${demoUser.password}`);
        console.log(`   Role: ${updatedUser.role}`);
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);

      const profileData = {
        email: demoUser.email,
        full_name: demoUser.fullName,
        password_hash: hashedPassword,
        role: demoUser.role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single();

      if (createError) {
        console.error(`❌ Error creating user: ${createError.message}`);
      } else {
        console.log(`✅ Created new admin user`);
        console.log(`   Email: ${demoUser.email}`);
        console.log(`   Password: ${demoUser.password}`);
        console.log(`   Role: ${newUser.role}`);
      }
    }

    // Test login
    console.log('\n🧪 Testing login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password: demoUser.password
    });

    if (authError) {
      console.log(`⚠️  Login test failed: ${authError.message}`);
      console.log('   Note: This might be normal if Supabase Auth user doesn\'t exist yet');
    } else {
      console.log('✅ Login test successful!');
      await supabase.auth.signOut();
    }

    // Also create the regular demo@example.com user for testing
    console.log('\n🚀 Creating demo@example.com user...');
    
    const regularDemo = {
      email: 'demo@example.com',
      password: 'demo123',
      fullName: 'Demo User',
      role: 'user'
    };

    const { data: existingDemo } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('email', regularDemo.email)
      .single();

    if (!existingDemo) {
      const demoHashedPassword = await bcrypt.hash(regularDemo.password, 12);
      
      const { data: demoUser, error: demoError } = await supabase
        .from('user_profiles')
        .insert([{
          email: regularDemo.email,
          full_name: regularDemo.fullName,
          password_hash: demoHashedPassword,
          role: regularDemo.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (demoError) {
        console.log(`⚠️  Could not create demo@example.com: ${demoError.message}`);
      } else {
        console.log(`✅ Created demo@example.com user`);
      }
    } else {
      console.log(`⚠️  demo@example.com already exists`);
    }

    console.log('\n🎉 Demo user setup completed!');
    console.log('\n📋 Demo Credentials:');
    console.log('================================');
    console.log(`ADMIN - ${demoUser.email} : ${demoUser.password}`);
    console.log(`USER  - demo@example.com : demo123`);
    console.log('================================');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

createDemoUser();
