const supabaseConfig = require('./supabase-config');
require('dotenv').config();

async function checkEmailSettings() {
  console.log('Checking Supabase email configuration...');
  
  // Initialize Supabase config
  const initialized = supabaseConfig.initialize();
  if (!initialized) {
    console.error('Failed to initialize Supabase');
    return;
  }
  
  const adminClient = supabaseConfig.getAdminClient();
  if (!adminClient) {
    console.error('Admin client not available');
    return;
  }
  
  try {
    // Check auth settings (this might not work via API, but let's try)
    console.log('\nTesting email sending by attempting to resend verification...');
    
    // Find an unconfirmed user to test with
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError.message);
      return;
    }
    
    const unconfirmedUser = users.users.find(user => !user.email_confirmed_at);
    
    if (unconfirmedUser) {
      console.log(`Found unconfirmed user: ${unconfirmedUser.email}`);
      
      // Try to resend confirmation email
      const { data: resendData, error: resendError } = await adminClient.auth.admin.generateLink({
        type: 'signup',
        email: unconfirmedUser.email
      });
      
      if (resendError) {
        console.error('Error generating signup link:', resendError.message);
        console.log('This might indicate email service issues');
      } else {
        console.log('Successfully generated signup link:', resendData.properties?.action_link);
        console.log('This suggests email service is configured, but emails might not be sending');
      }
    } else {
      console.log('No unconfirmed users found to test with');
    }
    
    // Check if we can get project settings (might not work via client)
    console.log('\nNote: To check email provider settings, you need to:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Authentication > Settings');
    console.log('3. Check the "SMTP Settings" section');
    console.log('4. If using default provider, consider setting up custom SMTP');
    console.log('\nCommon issues:');
    console.log('- Default Supabase email provider has very low rate limits');
    console.log('- Emails might go to spam folder');
    console.log('- Email provider might be blocking emails');
    console.log('- Site URL configuration might be incorrect');
    
  } catch (error) {
    console.error('Error checking email settings:', error.message);
  }
}

checkEmailSettings().catch(console.error);