const axios = require('axios');

const BASE_URL = 'https://kiani.exchange';

async function testOTPEndpoints() {
  console.log('=== Testing OTP Endpoints ===');
  
  try {
    // Test 1: Check if server is responding
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/api/auth/status`);
    console.log('Server Status:', healthResponse.data);
    
    // Test 2: Send OTP
    console.log('\n2. Testing send-otp endpoint...');
    const sendResponse = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
      phoneNumber: '09121958296'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('Send OTP Response:', sendResponse.data);
    
    if (sendResponse.data.success) {
      console.log('✅ OTP sent successfully');
      
      // In mock mode, the OTP should be logged
      console.log('Note: Check server logs for actual OTP (mock mode: 128288)');
      
      // Test 3: Verify OTP
      console.log('\n3. Testing verify-otp endpoint...');
      const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        phoneNumber: '09121958296',
        otp: '128288' // Mock OTP for testing
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Verify OTP Response:', verifyResponse.data);
      
      if (verifyResponse.data.success) {
        console.log('✅ OTP verification successful');
      } else {
        console.log('❌ OTP verification failed:', verifyResponse.data.error);
      }
    } else {
      console.log('❌ Failed to send OTP:', sendResponse.data.error);
    }
    
  } catch (error) {
    console.error('Error testing endpoints:', error.response?.data || error.message);
    
    // Provide specific error guidance
    if (error.response?.status === 404) {
      console.log('\n🔍 404 Error: OTP endpoints not found');
      console.log('Expected endpoints:');
      console.log('  POST /api/auth/send-otp');
      console.log('  POST /api/auth/verify-otp');
    } else if (error.response?.status === 400) {
      console.log('\n🔍 400 Error: Bad request - check phone number format');
      console.log('Use format: 09121958296 or +989121958296');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 Connection refused - server may be down');
      console.log('Check server status and ensure it\'s running');
    }
  }
}

// Run test
if (require.main === module) {
  testOTPEndpoints().catch(console.error);
}

module.exports = { testOTPEndpoints };