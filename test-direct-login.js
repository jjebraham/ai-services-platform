#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabaseConfig from './supabase-config.js';

async function testDirectLogin() {
  try {
    console.log('🧪 Testing direct login with demo user...\n');

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

    const testCredentials = {
      email: 'demo@example.com',
      password: 'demo123'
    };

    console.log(`Attempting to login: ${testCredentials.email}`);

    // Get user profile directly from our table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', testCredentials.email)
      .single();

    if (profileError || !profile) {
      console.log(`❌ User not found: ${profileError?.message || 'No profile'}`);
      return;
    }

    console.log(`✅ Found user profile: ${profile.email}, Role: ${profile.role}`);

    // Verify password
    if (!profile.password_hash) {
      console.log(`❌ No password hash found for user`);
      return;
    }

    const passwordValid = await bcrypt.compare(testCredentials.password, profile.password_hash);
    
    if (!passwordValid) {
      console.log(`❌ Invalid password`);
      return;
    }

    console.log(`✅ Password verified successfully`);

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

    console.log(`✅ JWT token generated`);

    // Update last login
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id);

    if (updateError) {
      console.log(`⚠️  Could not update last login: ${updateError.message}`);
    } else {
      console.log(`✅ Updated last login time`);
    }

    console.log('\n🎉 Direct login test successful!');
    console.log('\n📋 Login Response:');
    console.log('================================');
    console.log(`Success: true`);
    console.log(`Token: ${token.substring(0, 50)}...`);
    console.log(`User: ${profile.email} (${profile.role})`);
    console.log('================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testDirectLogin();
