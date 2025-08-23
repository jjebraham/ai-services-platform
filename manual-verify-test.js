const supabaseConfig = require('./supabase-config');
require('dotenv').config();

async function manualVerifyTest() {
  console.log('Testing manual email verification...');
  
  // Initialize Supabase config
  const initialized = supabaseConfig.initialize();
  if (!initialized) {
    console.error('Failed to initialize Supabase');
    return;
  }
  
  const adminClient = supabaseConfig.getAdminClient();
  const regularClient = supabaseConfig.getClient();
  
  if (!adminClient || !regularClient) {
    console.error('Clients not available');
    return;
  }
  
  try {
    // Find testuser@example.com
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError.message);
      return;
    }
    
    const testUser = users.users.find(user => user.email === 'testuser@example.com');
    
    if (!testUser) {
      console.log('testuser@example.com not found');
      return;
    }
    
    console.log(`Found user: ${testUser.email}`);
    console.log(`Email confirmed: ${!!testUser.email_confirmed_at}`);
    console.log(`User ID: ${testUser.id}`);
    
    if (!testUser.email_confirmed_at) {
      console.log('\nUser is not confirmed. Generating verification link...');
      
      // Generate a verification link
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'signup',
        email: testUser.email
      });
      
      if (linkError) {
        console.error('Error generating link:', linkError.message);
        return;
      }
      
      console.log('Generated verification link:', linkData.properties?.action_link);
      
      // Extract token from the link
      const url = new URL(linkData.properties.action_link);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');
      
      console.log(`\nToken: ${token}`);
      console.log(`Type: ${type}`);
      
      if (token) {
        console.log('\nAttempting to verify using the token...');
        
        // Try to verify the token
        const { data: verifyData, error: verifyError } = await regularClient.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        });
        
        if (verifyError) {
          console.error('Verification error:', verifyError.message);
          
          // Try alternative verification method
          console.log('\nTrying alternative verification method...');
          const { data: altVerifyData, error: altVerifyError } = await regularClient.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (altVerifyError) {
            console.error('Alternative verification error:', altVerifyError.message);
          } else {
            console.log('Alternative verification successful!');
            console.log('User:', altVerifyData.user?.email);
          }
        } else {
          console.log('Verification successful!');
          console.log('User:', verifyData.user?.email);
        }
        
        // Check user status again
        console.log('\nChecking user status after verification attempt...');
        const { data: updatedUsers, error: updatedError } = await adminClient.auth.admin.listUsers();
        
        if (!updatedError) {
          const updatedUser = updatedUsers.users.find(user => user.email === 'testuser@example.com');
          if (updatedUser) {
            console.log(`Updated email confirmed: ${!!updatedUser.email_confirmed_at}`);
          }
        }
      }
    } else {
      console.log('User is already confirmed!');
    }
    
  } catch (error) {
    console.error('Error in manual verify test:', error.message);
  }
}

manualVerifyTest().catch(console.error);