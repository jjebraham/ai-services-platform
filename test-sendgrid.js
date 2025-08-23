const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('Testing SendGrid integration with Supabase...');
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  try {
    console.log('\n🧪 Testing user registration with email verification...');
    
    const testEmail = `test-${Date.now()}@gmail.com`;
    console.log(`Using test email: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: "TestPass123!",
      options: {
        data: {
          first_name: "Test",
          last_name: "User"
        }
      }
    });
    
    if (error) {
      console.error('❌ Registration failed:', error.message);
      console.error('Full error:', error);
    } else {
      console.log('✅ Registration successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('\n📧 Check your SendGrid Activity dashboard to see if email was sent.');
      console.log('SendGrid Activity: https://app.sendgrid.com/email_activity');
    }
    
  } catch (err) {
    console.error('❌ Test failed with exception:', err.message);
    console.error('Stack:', err.stack);
  }
})();