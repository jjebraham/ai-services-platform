#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Supabase configuration
const supabaseUrl = 'https://rdfdqodfnefluyoeiyaf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkZmRxb2RmbmVmbHV5b2VpeWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzIzOTYsImV4cCI6MjA2OTQwODM5Nn0.tU_JuCdGrmd8656D5t2ppKFWDcZmh50xGELPjljxKRk';

// Access token from the magic link
const accessToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkVsQTAzWTZ4MjBXRlZFUjYiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JkZmRxb2RmbmVmbHV5b2VpeWFmLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmNmQxNDdlMS0xYzcyLTQ3MmMtOTA4Ni04MTU5ZGIyZmEwZjgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU1MzUwOTI4LCJpYXQiOjE3NTUzNDczMjgsImVtYWlsIjoiamplYnJhaGFtQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZW1haWxfdmVyaWZpZWQiOnRydWV9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im90cCIsInRpbWVzdGFtcCI6MTc1NTM0NzMyOH1dLCJzZXNzaW9uX2lkIjoiODk5ODIwZWQtZWI1MC00MTY4LTkzODAtYmY0Njc0NTI3ZmVkIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.ypxBtIS1QXLrLYz5PJSkwE5y7RZTE-QEpPPL2q_p600';

async function setPasswordViaMagicLink() {
  try {
    console.log('🔐 Setting up Supabase client with magic link token...');
    
    // Create Supabase client with the access token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    });

    // First, let's verify the token is valid by getting the user
    console.log('👤 Verifying magic link token...');
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }

    if (!user) {
      console.error('❌ No user found with this token');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('🆔 User ID:', user.id);

    // Hash the new password
    const newPassword = 'demo123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔒 Password hashed successfully');

    // Update the user profile with the new password hash
    console.log('📝 Updating user profile with new password...');
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('email', user.email)
      .select();

    if (updateError) {
      console.error('❌ Error updating user profile:', updateError);
      return;
    }

    console.log('✅ User profile updated successfully');
    console.log('📧 Email:', user.email);
    console.log('🔑 New password:', newPassword);
    console.log('🔐 Password hash stored in database');

    // Test the login by querying the user profile
    console.log('\n🧪 Testing login functionality...');
    const { data: testUser, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', user.email)
      .single();

    if (testError) {
      console.error('❌ Error testing user profile:', testError);
      return;
    }

    // Verify password hash
    const passwordValid = await bcrypt.compare(newPassword, testUser.password_hash);
    
    if (passwordValid) {
      console.log('✅ Password verification successful!');
      console.log('🎉 Login should now work with:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${newPassword}`);
    } else {
      console.error('❌ Password verification failed');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
setPasswordViaMagicLink();
