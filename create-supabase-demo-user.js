require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

async function createSupabaseDemoUser() {
  try {
    console.log('🚀 Creating Supabase demo user...\n');

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase credentials not found, skipping Supabase demo user creation');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const demoUser = {
      email: 'demo@example.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
      role: 'user'
    };

    // Check if user already exists in user_profiles
    const { data: existingProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', demoUser.email)
      .single();

    if (!profileError && existingProfile) {
      console.log(`⚠️  User ${demoUser.email} already exists in Supabase, updating...`);
      
      // Update password hash
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          password_hash: hashedPassword,
          first_name: demoUser.firstName,
          last_name: demoUser.lastName,
          role: demoUser.role,
          is_active: true,
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', demoUser.email);

      if (updateError) {
        console.error('❌ Error updating user profile:', updateError);
        return;
      }

      console.log(`✅ Updated user profile: ${demoUser.email}`);
    } else {
      console.log(`Creating new user: ${demoUser.email}`);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      
      // Create user profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert([{
          email: demoUser.email,
          password_hash: hashedPassword,
          first_name: demoUser.firstName,
          last_name: demoUser.lastName,
          role: demoUser.role,
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user profile:', createError);
        return;
      }

      console.log(`✅ Created user profile: ${demoUser.email}`);
    }

    console.log('\n🎉 Supabase demo user created/updated successfully!');
    console.log('📋 Demo Credentials:');
    console.log('==================');
    console.log(`Email: ${demoUser.email}`);
    console.log(`Password: ${demoUser.password}`);
    console.log('==================');
    
  } catch (error) {
    console.error('❌ Error creating Supabase demo user:', error);
  }
}

createSupabaseDemoUser();
