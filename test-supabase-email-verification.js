require('dotenv').config();
const supabaseConfig = require('./supabase-config');

async function testSupabaseEmailVerification() {
  console.log('🔍 Testing Supabase Email Verification System...');
  
  try {
    // Initialize Supabase config
    const initialized = supabaseConfig.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize Supabase');
      return;
    }
    
    const adminClient = supabaseConfig.getAdminClient();
    const regularClient = supabaseConfig.getClient();
    
    if (!adminClient || !regularClient) {
      console.error('❌ Supabase clients not available');
      return;
    }
    
    console.log('✅ Supabase clients initialized successfully');
    
    // Check current users and their verification status
    console.log('\n📊 Checking user verification status...');
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error listing users:', usersError.message);
      return;
    }
    
    console.log(`📈 Total users in system: ${users.users.length}`);
    
    const verifiedUsers = users.users.filter(user => user.email_confirmed_at);
    const unverifiedUsers = users.users.filter(user => !user.email_confirmed_at);
    
    console.log(`✅ Verified users: ${verifiedUsers.length}`);
    console.log(`⏳ Unverified users: ${unverifiedUsers.length}`);
    
    // Show details of unverified users
    if (unverifiedUsers.length > 0) {
      console.log('\n⏳ Unverified users:');
      unverifiedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (Created: ${new Date(user.created_at).toLocaleString()})`);
      });
    }
    
    // Test email verification by creating a test user
    console.log('\n🧪 Testing email verification with a test user...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Creating test user: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await regularClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email`
      }
    });
    
    if (signUpError) {
      console.error('❌ Error creating test user:', signUpError.message);
      return;
    }
    
    if (signUpData.user) {
      console.log('✅ Test user created successfully');
      console.log(`📧 User ID: ${signUpData.user.id}`);
      console.log(`📧 Email: ${signUpData.user.email}`);
      console.log(`📧 Email confirmed: ${!!signUpData.user.email_confirmed_at}`);
      
      if (!signUpData.user.email_confirmed_at) {
        console.log('📨 Verification email should have been sent');
        
        // Try to generate a verification link manually
        console.log('\n🔗 Generating manual verification link...');
        const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
          type: 'signup',
          email: testEmail
        });
        
        if (linkError) {
          console.error('❌ Error generating verification link:', linkError.message);
          console.log('⚠️  This might indicate email service configuration issues');
        } else {
          console.log('✅ Verification link generated successfully');
          console.log('🔗 Link:', linkData.properties?.action_link);
          console.log('📧 This confirms email verification system is working');
        }
      }
      
      // Clean up test user
      console.log('\n🧹 Cleaning up test user...');
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(signUpData.user.id);
      if (deleteError) {
        console.warn('⚠️  Could not delete test user:', deleteError.message);
      } else {
        console.log('✅ Test user cleaned up successfully');
      }
    }
    
    // Check Supabase project settings
    console.log('\n⚙️  Supabase Configuration Check:');
    console.log('📧 Email Provider: Supabase uses built-in email service by default');
    console.log('🔧 To check/configure email settings:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to Authentication > Settings');
    console.log('   3. Check "Email" section for:');
    console.log('      - Enable email confirmations: Should be ON');
    console.log('      - Email templates: Can be customized');
    console.log('      - SMTP settings: Can use custom provider (SendGrid, etc.)');
    
    console.log('\n📋 Environment Variables Check:');
    console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set'}`);
    console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'} (for email redirects)`);
    
    console.log('\n💡 Common Email Issues:');
    console.log('1. Emails going to spam folder');
    console.log('2. Default Supabase email provider has rate limits');
    console.log('3. Site URL not configured correctly in Supabase dashboard');
    console.log('4. Email templates not customized');
    console.log('5. Custom SMTP provider not configured (if needed)');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Check Supabase Dashboard > Authentication > Settings');
    console.log('2. Verify "Enable email confirmations" is enabled');
    console.log('3. Test with a real email address');
    console.log('4. Check spam folder for verification emails');
    console.log('5. Consider setting up custom SMTP if using high volume');
    
  } catch (error) {
    console.error('❌ Error testing email verification:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testSupabaseEmailVerification().catch(console.error);