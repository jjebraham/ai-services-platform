#!/usr/bin/env node

/**
 * Supabase Demo Users Initialization Script
 * This script creates demo users for testing the dashboard and internal pages
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabaseConfig = require('../supabase-config');

// Demo users configuration
const demoUsers = [
  {
    email: process.env.DEMO_USER_EMAIL || 'demo@aiservices.com',
    password: process.env.DEMO_USER_PASSWORD || 'demo123456',
    fullName: process.env.DEMO_USER_NAME || 'Demo User',
    role: 'user'
  },
  {
    email: process.env.DEMO_ADMIN_EMAIL || 'demoadmin@aiservices.com',
    password: process.env.DEMO_ADMIN_PASSWORD || 'demoadmin123456',
    fullName: process.env.DEMO_ADMIN_NAME || 'Demo Admin',
    role: 'admin'
  },
  {
    email: process.env.ADMIN_EMAIL || 'admin@aiservices.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456',
    fullName: 'System Administrator',
    role: 'admin'
  }
];

async function initSupabaseDemoUsers() {
  try {
    console.log('🚀 Initializing Supabase demo users...\n');

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
        const { data: existingProfile, error: checkError } = await supabase
          .from('user_profiles')
          .select('id, email')
          .eq('email', userData.email)
          .single();

        if (existingProfile) {
          console.log(`⚠️  User ${userData.email} already exists in profiles, skipping...`);
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(userData.password, salt);

        // Try to sign up the user with Supabase Auth first
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
          id: authUser ? authUser.id : undefined, // Use auth user ID if available
          email: userData.email,
          full_name: userData.fullName,
          password_hash: passwordHash,
          role: userData.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: null
        };

        // If no auth user ID, remove the id field to let Supabase generate one
        if (!authUser) {
          delete profileData.id;
        }

        const { data: profileResult, error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error(`❌ Error creating profile for ${userData.email}:`, profileError.message);
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

    console.log('🎉 Supabase demo users initialization completed!\n');
    
    console.log('📋 Demo Credentials Summary:');
    console.log('================================');
    demoUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()} - ${user.email} : ${user.password}`);
    });
    console.log('================================\n');
    
    console.log('🔗 You can now login to:');
    console.log(`   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`   Backend: http://localhost:${process.env.PORT || 5000}`);
    console.log('');

    // Test connection
    const connectionTest = await supabaseConfig.testConnection();
    if (connectionTest.success) {
      console.log('✅ Supabase connection test passed');
    } else {
      console.log('⚠️  Supabase connection test failed:', connectionTest.error);
    }

  } catch (error) {
    console.error('❌ Error initializing Supabase demo users:', error);
  } finally {
    console.log('📤 Demo user initialization completed');
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  initSupabaseDemoUsers();
}

module.exports = { initSupabaseDemoUsers, demoUsers };