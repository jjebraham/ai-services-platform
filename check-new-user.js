require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkNewUser() {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const targetEmail = 'ahkr1900@gmail.com';
        
        console.log('=== CHECKING SUPABASE AUTH ==>');
        
        // Get user from Supabase Auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error fetching users from Auth:', authError);
            return;
        }
        
        const authUser = users.find(user => user.email === targetEmail);
        
        if (authUser) {
            console.log('✅ User found in Supabase Auth:', {
                id: authUser.id,
                email: authUser.email,
                email_confirmed_at: authUser.email_confirmed_at,
                created_at: authUser.created_at,
                user_metadata: authUser.user_metadata
            });
        } else {
            console.log('❌ User NOT found in Supabase Auth');
        }
        
        console.log('\n=== CHECKING USER_PROFILES TABLE ==>');
        
        // Check user_profiles table
        const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', targetEmail);
            
        if (profileError) {
            console.error('Error checking user_profiles:', profileError);
        } else if (profileData && profileData.length > 0) {
            console.log('✅ User found in user_profiles:', profileData[0]);
        } else {
            console.log('❌ User NOT found in user_profiles table');
        }
        
    } catch (err) {
        console.error('Script error:', err);
    }
}

checkNewUser();