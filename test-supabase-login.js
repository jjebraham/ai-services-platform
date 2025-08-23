require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const testSupabaseLogin = async () => {
  try {
    console.log('Testing Supabase authentication...');
    
    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized');
    
    // Check if user exists in auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError.message);
      return;
    }
    
    const targetUser = users.find(u => u.email === 'kianirad2020@gmail.com');
    if (!targetUser) {
      console.log('User not found in Supabase Auth');
      return;
    }
    
    console.log('User found in Supabase Auth:', {
      id: targetUser.id,
      email: targetUser.email,
      email_confirmed_at: targetUser.email_confirmed_at,
      created_at: targetUser.created_at,
      last_sign_in_at: targetUser.last_sign_in_at
    });
    
    // Note: For users registered via email confirmation,
    // they need to set their password through the reset password flow
    // or sign in using magic link/OTP
    
    console.log('\n=== Authentication Status ===');
    console.log('✅ User exists in Supabase Auth');
    console.log('✅ Email is verified:', !!targetUser.email_confirmed_at);
    console.log('📧 User registered via email confirmation');
    console.log('🔑 Password authentication requires password reset or magic link');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in Supabase login test:', error.message);
    process.exit(1);
  }
};

testSupabaseLogin();