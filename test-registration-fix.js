require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Test registration endpoint with the fixed auth service
async function testRegistrationFix() {
  console.log('=== TESTING REGISTRATION FIX ===\n');
  
  // Test data
  const testUser = {
    email: `test-fix-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    fullName: 'Test Fix User'
  };
  
  console.log('1. Testing registration endpoint...');
  console.log(`Test email: ${testUser.email}`);
  
  try {
    // Test the registration endpoint
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    console.log('Registration response:', result);
    
    if (result.success) {
      console.log('✅ Registration successful!');
      
      // Wait a moment for the profile to be created
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user profile was created
      console.log('\n2. Checking if user profile was created...');
      
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', testUser.email)
        .single();
      
      if (profileError) {
        console.log('❌ Profile not found:', profileError.message);
      } else {
        console.log('✅ User profile created successfully!');
        console.log('Profile data:', {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          is_active: profile.is_active
        });
      }
      
      // Check Supabase Auth
      console.log('\n3. Checking Supabase Auth...');
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log('❌ Error checking auth users:', authError.message);
      } else {
        const testAuthUser = authUsers.users.find(u => u.email === testUser.email);
        if (testAuthUser) {
          console.log('✅ User found in Supabase Auth!');
          console.log('Auth user data:', {
            id: testAuthUser.id,
            email: testAuthUser.email,
            email_confirmed_at: testAuthUser.email_confirmed_at,
            created_at: testAuthUser.created_at
          });
        } else {
          console.log('❌ User not found in Supabase Auth');
        }
      }
      
    } else {
      console.log('❌ Registration failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the test
testRegistrationFix().catch(console.error);