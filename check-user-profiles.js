require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function checkUserProfiles() {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        console.log('Checking user_profiles table for kianirad2020@gmail.com...');
        
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', 'kianirad2020@gmail.com');

        if (error) {
            console.error('Error querying user_profiles:', error);
        } else {
            console.log('User profiles query result:', JSON.stringify(data, null, 2));
            console.log('Number of records found:', data.length);
        }

        // Also check if the table exists and has any records
        const { data: allUsers, error: allError } = await supabase
            .from('user_profiles')
            .select('email')
            .limit(5);

        if (allError) {
            console.error('Error checking all user_profiles:', allError);
        } else {
            console.log('Sample user_profiles emails:', allUsers.map(u => u.email));
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

checkUserProfiles();