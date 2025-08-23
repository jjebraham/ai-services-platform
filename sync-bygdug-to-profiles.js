require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUserToProfiles() {
    const email = 'bygdug@gmail.com';
    
    console.log('=== SYNCING USER TO PROFILES TABLE ===\n');
    
    try {
        // 1. Get user from Supabase Auth
        console.log('1. Fetching user from Supabase Auth...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error fetching auth users:', authError);
            return;
        }
        
        const user = authUsers.users.find(u => u.email === email);
        if (!user) {
            console.log('❌ User not found in Supabase Auth');
            return;
        }
        
        console.log('✅ User found in Supabase Auth:');
        console.log('   - ID:', user.id);
        console.log('   - Email:', user.email);
        console.log('   - Email Confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
        
        // 2. Check if user already exists in user_profiles
        console.log('\n2. Checking if user exists in user_profiles...');
        const { data: existingProfile, error: checkError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', email)
            .single();
            
        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking user_profiles:', checkError);
            return;
        }
        
        if (existingProfile) {
            console.log('✅ User already exists in user_profiles');
            return;
        }
        
        console.log('❌ User not found in user_profiles, creating...');
        
        // 3. Extract name from email or use default
        const emailParts = email.split('@')[0];
        const fullName = emailParts || 'User';
        
        // 4. Insert user into user_profiles table
        console.log('\n3. Creating user in user_profiles table...');
        const { data: profileData, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                id: user.id,
                email: user.email,
                full_name: fullName,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (insertError) {
            console.error('❌ Error creating user profile:', insertError);
            return;
        }
        
        console.log('✅ User successfully created in user_profiles:');
        console.log('   - ID:', profileData.id);
        console.log('   - Email:', profileData.email);
        console.log('   - Full Name:', profileData.full_name);
        console.log('   - Created:', profileData.created_at);
        
        // 5. Verify the sync
        console.log('\n4. Verifying sync...');
        const { data: verifyData, error: verifyError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', email)
            .single();
            
        if (verifyError) {
            console.error('❌ Verification failed:', verifyError);
        } else {
            console.log('✅ Sync verified successfully!');
            console.log('   - Profile ID:', verifyData.id);
            console.log('   - Profile Email:', verifyData.email);
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Run the sync function
syncUserToProfiles().then(() => {
    console.log('\n=== SYNC COMPLETE ===');
    process.exit(0);
}).catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
});