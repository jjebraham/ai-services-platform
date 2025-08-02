#!/usr/bin/env node

/**
 * Supabase Setup Script
 * This script helps you easily configure your Supabase credentials in the .env file
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSupabase() {
  console.log('🚀 Supabase Setup Script');
  console.log('========================\n');
  
  console.log('Please provide your Supabase project credentials:');
  console.log('You can find these in your Supabase project dashboard > Settings > API\n');
  
  try {
    const supabaseUrl = await question('Enter your Supabase Project URL: ');
    const supabaseAnonKey = await question('Enter your Supabase Anon/Public Key: ');
    const supabaseServiceKey = await question('Enter your Supabase Service Role Key (optional): ');
    
    // Validate URL
    if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
      console.error('❌ Invalid Supabase URL. Please provide a valid Supabase project URL.');
      process.exit(1);
    }
    
    if (!supabaseAnonKey) {
      console.error('❌ Supabase Anon Key is required.');
      process.exit(1);
    }
    
    // Read current .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Supabase credentials
    envContent = envContent.replace(/SUPABASE_URL=.*/, `SUPABASE_URL=${supabaseUrl.trim()}`);
    envContent = envContent.replace(/SUPABASE_ANON_KEY=.*/, `SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}`);
    
    if (supabaseServiceKey) {
      envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey.trim()}`);
    }
    
    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Supabase credentials saved to .env file!');
    console.log('🔄 Please restart your server to apply the changes.');
    console.log('💡 Your server will now automatically load these credentials on startup.');
    
  } catch (error) {
    console.error('❌ Error setting up Supabase:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  setupSupabase();
}

module.exports = { setupSupabase };