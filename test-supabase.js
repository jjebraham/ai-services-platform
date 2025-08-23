const supabaseConfig = require('./supabase-config');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Initialize Supabase config
  const initialized = supabaseConfig.initialize();
  console.log('Supabase initialized:', initialized);
  
  if (!initialized) {
    console.error('Failed to initialize Supabase');
    return;
  }
  
  // Test connection
  const connectionTest = await supabaseConfig.testConnection();
  console.log('Connection test result:', connectionTest);
  
  // Test direct client creation
  try {
    const directClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    
    console.log('Direct client created successfully');
    
    // Test auth functionality
    const { data: authData, error: authError } = await directClient.auth.getSession();
    console.log('Auth session test:', { success: !authError, error: authError?.message });
    
    // Test a simple query to auth.users (this should work even if no custom tables exist)
    const { data: userData, error: userError } = await directClient.auth.getUser();
    console.log('Get user test:', { success: !userError, error: userError?.message });
    
    // Test if we can access the auth admin functions
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('Admin client created successfully');
    
    // Try to list users (this requires service role key)
    const { data: adminData, error: adminError } = await adminClient.auth.admin.listUsers();
    console.log('Admin list users test:', { 
      success: !adminError, 
      error: adminError?.message,
      userCount: adminData?.users?.length || 0
    });
    
    if (adminData?.users) {
      console.log('Existing users in database:');
      adminData.users.forEach(user => {
        console.log(`- ${user.email} (confirmed: ${!!user.email_confirmed_at})`);
      });
    }
    
  } catch (error) {
    console.error('Direct client test failed:', error.message);
  }
}

testSupabaseConnection().catch(console.error);