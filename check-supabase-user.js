require('dotenv').config();
const supabaseConfig = require('./supabase-config');

const checkSupabaseUser = async () => {
  try {
    if (!supabaseConfig.isConfigured()) {
      console.log('Supabase not configured');
      return;
    }

    const supabase = supabaseConfig.getClient();
    if (!supabase) {
      console.log('Supabase client not available');
      return;
    }

    // Check in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError.message);
    } else {
      const user = authUsers.users.find(u => u.email === 'kianirad2020@gmail.com');
      console.log('Supabase Auth User:', user ? {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        user_metadata: user.user_metadata
      } : 'Not found in auth.users');
    }

    // Check in user_profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'kianirad2020@gmail.com');
    
    if (profileError) {
      console.error('Error fetching user profiles:', profileError.message);
    } else {
      console.log('Supabase User Profile:', profiles.length > 0 ? profiles[0] : 'Not found in user_profiles');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkSupabaseUser();