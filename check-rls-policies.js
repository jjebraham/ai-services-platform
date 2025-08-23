require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSPolicies() {
    console.log('=== CHECKING ROW LEVEL SECURITY POLICIES ===\n');
    
    try {
        // 1. Check if RLS is enabled on user_profiles table
        console.log('1. Checking RLS status on user_profiles table...');
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('check_table_rls', { table_name: 'user_profiles' })
            .single();
            
        if (tableError) {
            console.log('Could not check RLS status directly, trying alternative method...');
        }
        
        // 2. Try to query the table policies
        console.log('\n2. Checking existing policies on user_profiles...');
        const { data: policies, error: policyError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'user_profiles');
            
        if (policyError) {
            console.log('Could not query policies directly:', policyError.message);
        } else {
            console.log('Found', policies?.length || 0, 'policies on user_profiles table');
            if (policies && policies.length > 0) {
                policies.forEach((policy, index) => {
                    console.log(`   Policy ${index + 1}: ${policy.policyname} (${policy.cmd})`);
                });
            }
        }
        
        // 3. Test inserting with service role (should work)
        console.log('\n3. Testing insert with service role key...');
        const testEmail = `test-rls-${Date.now()}@example.com`;
        const testUserId = `test-${Date.now()}`;
        
        const { data: insertData, error: insertError } = await supabase
            .from('user_profiles')
            .insert({
                id: testUserId,
                email: testEmail,
                full_name: 'Test RLS User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (insertError) {
            console.log('❌ Insert failed with service role:', insertError.message);
            console.log('   Code:', insertError.code);
            console.log('   Details:', insertError.details);
        } else {
            console.log('✅ Insert successful with service role');
            console.log('   Created user:', insertData.email);
            
            // Clean up test user
            await supabase
                .from('user_profiles')
                .delete()
                .eq('id', testUserId);
            console.log('   Test user cleaned up');
        }
        
        // 4. Check if we can create a policy to allow inserts
        console.log('\n4. Suggested RLS policy for user_profiles:');
        console.log('   -- Allow service role to insert/update/select');
        console.log('   CREATE POLICY "Allow service role access" ON user_profiles');
        console.log('   FOR ALL USING (true);');
        console.log('');
        console.log('   -- Or allow authenticated users to manage their own profiles');
        console.log('   CREATE POLICY "Users can manage own profile" ON user_profiles');
        console.log('   FOR ALL USING (auth.uid() = id);');
        
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

// Run the check function
checkRLSPolicies().then(() => {
    console.log('\n=== RLS CHECK COMPLETE ===');
    process.exit(0);
}).catch(error => {
    console.error('RLS check failed:', error);
    process.exit(1);
});