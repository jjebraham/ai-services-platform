#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabaseConfig from './supabase-config.js';

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login with jjebraham@gmail.com...\n');

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

    const adminCredentials = {
      email: 'jjebraham@gmail.com',
      password: 'demo123'
    };

    console.log(`Attempting admin login: ${adminCredentials.email}`);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', adminCredentials.email)
      .single();

    if (profileError || !profile) {
      console.log(`❌ Admin user not found: ${profileError?.message || 'No profile'}`);
      return;
    }

    console.log(`✅ Found admin profile: ${profile.email}, Role: ${profile.role}`);

    // Verify password
    if (!profile.password_hash) {
      console.log(`❌ No password hash found for admin user`);
      return;
    }

    const passwordValid = await bcrypt.compare(adminCredentials.password, profile.password_hash);
    
    if (!passwordValid) {
      console.log(`❌ Invalid admin password`);
      return;
    }

    console.log(`✅ Admin password verified successfully`);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: profile.id, 
        email: profile.email, 
        role: profile.role 
      },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '24h' }
    );

    console.log(`✅ Admin JWT token generated`);

    console.log('\n🎉 Admin login test successful!');
    console.log('\n📋 Admin Login Response:');
    console.log('================================');
    console.log(`Success: true`);
    console.log(`Token: ${token.substring(0, 50)}...`);
    console.log(`User: ${profile.email} (${profile.role})`);
    console.log(`Full Name: ${profile.full_name}`);
    console.log('================================');

  } catch (error) {
    console.error('❌ Admin test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testAdminLogin();
