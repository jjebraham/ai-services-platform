#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();
import supabaseConfig from './supabase-config.js';

async function testSupabaseConnection() {
  try {
    console.log('🧪 Testing Supabase Connection...\n');
    
    // Initialize
    console.log('1. Initializing Supabase...');
    const initialized = supabaseConfig.initialize();
    console.log(`   ✅ Initialized: ${initialized}\n`);
    
    // Get clients
    console.log('2. Getting clients...');
    const supabase = supabaseConfig.getClient();
    const adminSupabase = supabaseConfig.getAdminClient();
    console.log(`   ✅ Regular client: ${supabase ? 'Available' : 'Not available'}`);
    console.log(`   ✅ Admin client: ${adminSupabase ? 'Available' : 'Not available'}\n`);
    
    if (!supabase) {
      console.log('❌ No Supabase client available');
      return;
    }
    
    // Test connection with simple query
    console.log('3. Testing basic connection...');
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ⚠️  Query error: ${error.message}`);
      } else {
        console.log(`   ✅ Connection successful`);
      }
    } catch (err) {
      console.log(`   ⚠️  Connection error: ${err.message}`);
    }
    
    // Check table structure
    console.log('\n4. Checking table structure...');
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ⚠️  Table structure error: ${error.message}`);
      } else {
        console.log(`   ✅ Table accessible`);
        if (data && data.length > 0) {
          console.log(`   📋 Available columns:`, Object.keys(data[0]));
        }
      }
    } catch (err) {
      console.log(`   ⚠️  Table check error: ${err.message}`);
    }
    
    // List all tables
    console.log('\n5. Checking available tables...');
    try {
      const { data, error } = await supabase.rpc('get_public_tables');
      if (error) {
        console.log(`   ⚠️  Could not list tables: ${error.message}`);
      } else {
        console.log(`   ✅ Tables found:`, data);
      }
    } catch (err) {
      // Try alternative method
      try {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          console.log(`   ✅ REST API accessible`);
        } else {
          console.log(`   ⚠️  REST API error: ${response.status}`);
        }
      } catch (fetchErr) {
        console.log(`   ⚠️  REST API test error: ${fetchErr.message}`);
      }
    }
    
    // Test auth functionality
    console.log('\n6. Testing auth functionality...');
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log(`   ✅ Auth system accessible`);
      console.log(`   📋 Current session: ${data?.session ? 'Active' : 'None'}`);
    } catch (err) {
      console.log(`   ⚠️  Auth test error: ${err.message}`);
    }
    
    console.log('\n🎉 Supabase connection test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testSupabaseConnection();
