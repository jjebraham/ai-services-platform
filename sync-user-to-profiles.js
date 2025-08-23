require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function syncUserToProfiles() {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const targetEmail = 'kianirad2020@gmail.com';
        
        console.log('Fetching user from Supabase Auth...');
        
        // Get user from Supabase Auth
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error fetching users from Auth:', authError);
            return;
        }
        
        const authUser = users.find(user => user.email === targetEmail);
        
        if (!authUser) {
            console.log('User not found in Supabase Auth');
            return;
        }
        
        console.log('Found user in Auth:', {
            id: authUser.id,
            email: authUser.email,
            email_confirmed_at: authUser.email_confirmed_at,
            created_at: authUser.created_at
        });
        
        // Check if user already exists in user_profiles
        const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', targetEmail)
            .single();
            
        if (existingProfile) {
            console.log('User already exists in user_profiles');
            return;
        }
        
        // Create user profile
        const userProfile = {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            created_at: authUser.created_at,
            updated_at: new Date().toISOString(),
            is_active: true,
            role: 'user',
            last_login: null
        };
        
        console.log('Creating user profile:', userProfile);
        
        const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert([userProfile])
            .select();
            
        if (insertError) {
            console.error('Error creating user profile:', insertError);
        } else {
            console.log('Successfully created user profile:', newProfile);
        }
        
    } catch (err) {
        console.error('Script error:', err);
    }
}

syncUserToProfiles();