const axios = require('axios');

async function quickOTPTest() {
  console.log('=== Quick OTP Test for Local Server ===\n');
  
  const baseURL = process.env.BASE_URL || 'http://localhost:3002/api/auth';
  const testPhone = '09121958296';
  const testOTP = '128288';
  
  console.log('Testing against server:', baseURL);
  console.log('Test phone:', testPhone);
  console.log('Expected OTP (mock mode):', testOTP);
  console.log('---');
  
  try {
    // Step 1: Send OTP
    console.log('1. Sending OTP...');
    const sendResponse = await axios.post(`${baseURL}/send-otp`, {
      phoneNumber: testPhone
    }, { headers: { 'Content-Type': 'application/json' }});
    
    console.log('✅ Send OTP Result:', JSON.stringify(sendResponse.data, null, 2));
    
    if (sendResponse.data.success) {
      // Step 2: Verify OTP
      console.log('\n2. Verifying OTP...');
      const verifyResponse = await axios.post(`${baseURL}/verify-otp`, {
        phoneNumber: testPhone,
        otp: testOTP
      }, { headers: { 'Content-Type': 'application/json' }});
      
      console.log('✅ Verify OTP Result:', JSON.stringify(verifyResponse.data, null, 2));
      
      if (verifyResponse.data.success) {
        console.log('\n🎉 SUCCESS: OTP flow working correctly!');
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
      console.log('   npm run start:supabase');
      console.log('   OR');
      console.log('   node simple-supabase-server.js');
    }
  }
}

// Run test
quickOTPTest().catch(console.error);