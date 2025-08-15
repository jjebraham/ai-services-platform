const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function interactiveOTPTest() {
  console.log('🧪 Interactive OTP Test for Local Server');
  console.log('=' .repeat(50));
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3005/api/auth';
  const testPhone = '09121958296';
  
  console.log('Testing against server:', baseURL);
  console.log('Test phone:', testPhone);
  console.log('---');
  
  try {
    // Step 1: Send OTP
    console.log('\n📱 Step 1: Sending OTP...');
    const sendResponse = await axios.post(`${baseURL}/send-otp`, {
      phoneNumber: testPhone
    }, { 
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    });
    
    console.log('✅ Send OTP Result:');
    console.log(JSON.stringify(sendResponse.data, null, 2));
    
    if (sendResponse.data.success) {
      // Step 2: Wait for user to get OTP
      console.log('\n⏳ Please check your phone for the OTP...');
      const otpFromUser = await question('🔐 Enter the OTP you received: ');
      
      // Step 3: Verify OTP
      console.log('\n🔍 Step 2: Verifying OTP...');
      const verifyResponse = await axios.post(`${baseURL}/verify-otp`, {
        phoneNumber: testPhone,
        otp: otpFromUser.trim()
      }, { 
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      });
      
      console.log('✅ Verify OTP Result:');
      console.log(JSON.stringify(verifyResponse.data, null, 2));
      
      if (verifyResponse.data.success) {
        console.log('\n🎉 SUCCESS: OTP flow working correctly!');
        console.log('User authenticated successfully');
        if (verifyResponse.data.user) {
          console.log('User info:', verifyResponse.data.user);
        }
      } else {
        console.log('\n❌ FAILURE: OTP verification failed');
        console.log('Error:', verifyResponse.data.error);
      }
    } else {
      console.log('\n❌ FAILURE: Could not send OTP');
      console.log('Error:', sendResponse.data.error);
    }
    
  } catch (error) {
    console.error('\n💥 TEST ERROR:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Fix: Start the server with:');
      console.log('   PORT=3005 OFFLINE_AUTH=1 USE_PROXY=1 npm run start:supabase');
    } else if (error.code === 'ECONNABORTED') {
      console.log('\n⏰ Request timed out - Check server logs');
    }
  } finally {
    rl.close();
  }
}

// Add a test status endpoint call
async function testServerStatus() {
  const baseURL = process.env.BASE_URL || 'http://localhost:3005';
  
  try {
    console.log('\n🔍 Testing server status...');
    const statusResponse = await axios.get(`${baseURL}/api/auth/status`, {
      timeout: 5000
    });
    console.log('Server status:', statusResponse.data);
  } catch (error) {
    console.log('❌ Server status check failed:', error.message);
  }
}

// Run test
async function main() {
  await testServerStatus();
  await interactiveOTPTest();
}

main().catch(console.error);