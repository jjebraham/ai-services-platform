#!/usr/bin/env node

/**
 * Supabase Demo Users Creation Script
 * This script creates demo users for testing
 */

import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import supabaseConfig from './supabase-config.js';

// Demo users configuration
const demoUsers = [
  {
    email: 'demo@example.com',
    password: 'demo123',
    fullName: 'Demo User',
    role: 'user'
  },
  {
    email: 'demo@aiservices.com', 
    password: 'demo123456',
    fullName: 'Demo AI User',
    role: 'user'
  },
  {
    email: 'admin@aiservices.com',
    password: 'admin123456',
    fullName: 'System Administrator',
    role: 'admin'
  }
];

async function createSupabaseDemoUsers() {
  try {
    console.log('🚀 Creating Supabase demo users...\n');

    // Initialize Supabase
    const initialized = supabaseConfig.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize Supabase. Please check your configuration.');
      process.exit(1);
    }

    const supabase = supabaseConfig.getClient();
    const adminSupabase = supabaseConfig.getAdminClient();

    if (!supabase) {
      console.error('❌ Supabase client not available');
      process.exit(1);
    }

    console.log('✅ Connected to Supabase\n');

    for (const userData of demoUsers) {
      try {
        console.log(`Creating ${userData.role} user: ${userData.email}...`);

        // Check if user already exists in user_profiles
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id, email')
          .eq('email', userData.email)
          .single();

        if (existingProfile) {
          console.log(`⚠️  User ${userData.email} already exists in profiles, skipping...`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(userData.password, 12);

        // Try to create auth user first (if admin client available)
        let authUser = null;
        if (adminSupabase) {
          try {
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
              email: userData.email,
              password: userData.password,
              email_confirm: true
            });

            if (authError) {
              console.log(`⚠️  Auth user creation failed: ${authError.message}`);
            } else {
              authUser = authData.user;
              console.log(`✅ Created auth user: ${userData.email}`);
            }
          } catch (authErr) {
            console.log(`⚠️  Auth user creation error: ${authErr.message}`);
          }
        }

        // Create user profile
        const profileData = {
          email: userData.email,
          full_name: userData.fullName,
          password_hash: passwordHash,
          role: userData.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auth_user_id: authUser?.id || null
        };

        const { data: profileResult, error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error(`❌ Error creating profile for ${userData.email}:`, profileError.message);
          
          // If profile creation failed but auth user was created, clean up
          if (authUser && adminSupabase) {
            try {
              await adminSupabase.auth.admin.deleteUser(authUser.id);
              console.log(`🧹 Cleaned up auth user for ${userData.email}`);
            } catch (cleanupError) {
              console.log(`⚠️  Cleanup failed: ${cleanupError.message}`);
            }
          }
          continue;
        }

        console.log(`✅ Created ${userData.role} profile: ${userData.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log(`   Name: ${userData.fullName}`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('🎉 Supabase demo users creation completed!\n');
    
    console.log('📋 Demo Credentials Summary:');
    console.log('================================');
    demoUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()} - ${user.email} : ${user.password}`);
    });
    console.log('================================\n');

    // Test login with demo user
    console.log('🧪 Testing demo user login...');
    const testUser = demoUsers[0];
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (authError) {
      console.log(`⚠️  Demo login test failed: ${authError.message}`);
    } else {
      console.log('✅ Demo login test passed!');
      // Sign out after test
      await supabase.auth.signOut();
    }

  } catch (error) {
    console.error('❌ Error creating Supabase demo users:', error);
  } finally {
    console.log('📤 Demo user creation completed');
    process.exit(0);
  }
}

// Run the script
createSupabaseDemoUsers();
