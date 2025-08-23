require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Debug registration issues
async function debugRegistration() {
  console.log('=== DEBUGGING REGISTRATION ISSUES ===\n');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  // Initialize Supabase client with service role
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  console.log('\n2. Testing Supabase connection...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return;
  }
  
  // Check for specific user (bygdug@gmail.com)
  console.log('\n3. Checking for bygdug@gmail.com...');
  
  // Check in Supabase Auth
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      const bygdugAuth = authUsers.users.find(user => user.email === 'bygdug@gmail.com');
      if (bygdugAuth) {
        console.log('✅ bygdug@gmail.com found in Supabase Auth');
        console.log('   - ID:', bygdugAuth.id);
        console.log('   - Email confirmed:', bygdugAuth.email_confirmed_at ? '✅ Yes' : '❌ No');
        console.log('   - Created:', bygdugAuth.created_at);
        
        // Check in user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', 'bygdug@gmail.com')
          .single();
        
        if (profileError) {
          console.log('❌ bygdug@gmail.com NOT found in user_profiles:', profileError.message);
        } else {
          console.log('✅ bygdug@gmail.com found in user_profiles');
          console.log('   - Profile ID:', profile.id);
          console.log('   - Full name:', profile.full_name);
          console.log('   - Role:', profile.role);
          console.log('   - Active:', profile.is_active);
        }
      } else {
        console.log('❌ bygdug@gmail.com NOT found in Supabase Auth');
      }
    }
  } catch (err) {
    console.log('❌ Error checking users:', err.message);
  }
  
  // Show recent users in Supabase Auth
  console.log('\n4. Recent users in Supabase Auth (last 5):');
  try {
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      const recentUsers = authUsers.users
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.id}) - ${user.created_at}`);
      });
    }
  } catch (err) {
    console.log('❌ Error fetching recent users:', err.message);
  }
  
  // Show recent profiles
  console.log('\n5. Recent user profiles (last 5):');
  try {
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email} (${profile.id}) - ${profile.created_at}`);
      });
    }
  } catch (err) {
    console.log('❌ Error fetching recent profiles:', err.message);
  }
  
  // Test RLS policies
  console.log('\n6. Testing RLS policies...');
  try {
    // Try to insert with service role (should work)
    const testId = `test-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: testId,
        email: `test-${Date.now()}@example.com`,
        full_name: 'Test User',
        role: 'user',
        is_active: true
      });
    
    if (insertError) {
      console.log('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Insert test successful (service role can insert)');
      
      // Clean up test record
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', testId);
    }
  } catch (err) {
    console.log('❌ RLS test error:', err.message);
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
}

// Run the debug
debugRegistration().catch(console.error);