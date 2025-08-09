// Supabase Configuration
import { createClient } from '@supabase/supabase-js';

class SupabaseConfig {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    this.client = null;
    this.adminClient = null;
  }

  // Initialize Supabase client
  initialize() {
    // Update credentials from environment
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase credentials not configured. Using fallback database.');
      return false;
    }

    try {
      // Validate URL format
      new URL(this.supabaseUrl);
      
      // Regular client for user operations
      this.client = createClient(this.supabaseUrl, this.supabaseKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true
        }
      });
      
      // Admin client for administrative operations
      if (this.supabaseServiceKey) {
        this.adminClient = createClient(this.supabaseUrl, this.supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
      }

      console.log('Supabase initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error.message);
      this.client = null;
      this.adminClient = null;
      return false;
    }
  }

  // Get regular client
  getClient() {
    return this.client;
  }

  // Get admin client
  getAdminClient() {
    return this.adminClient;
  }

  // Check if Supabase is configured
  isConfigured() {
    return this.client !== null;
  }

  // Test connection
  async testConnection() {
    if (!this.client) {
      return { success: false, error: 'Supabase not initialized' };
    }

    try {
      const { data, error } = await this.client
        .from('users')
        .select('count')
        .limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Supabase connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create tables if they don't exist
  async createTables() {
    if (!this.adminClient) {
      return { success: false, error: 'Admin client not available' };
    }

    try {
      // Create user_profiles table directly
      const { error: profilesError } = await this.adminClient
        .from('user_profiles')
        .select('id')
        .limit(1);

      // If table doesn't exist, create it using SQL
      if (profilesError && profilesError.code === 'PGRST116') {
        // Table doesn't exist, we need to create it
        // Since we can't execute raw SQL directly, we'll try to insert a test record
        // and let Supabase Auth handle the user creation
        console.log('user_profiles table does not exist. Please create it manually in Supabase.');
        
        return { 
          success: false, 
          error: 'Tables need to be created manually in Supabase. Please go to your Supabase dashboard and create the user_profiles table with columns: id (uuid), email (text), full_name (text), password_hash (text), created_at (timestamp), updated_at (timestamp), is_active (boolean), role (text), last_login (timestamp)' 
        };
      }

      // Check if users table exists (though it might be managed by Supabase Auth)
      const { error: usersError } = await this.adminClient
        .from('users')
        .select('id')
        .limit(1);

      if (usersError && usersError.code === 'PGRST116') {
        console.log('users table does not exist, but this might be normal if using Supabase Auth');
      }

      return { success: true, message: 'Tables verified/created successfully' };
    } catch (error) {
      console.error('Error checking/creating tables:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SupabaseConfig();