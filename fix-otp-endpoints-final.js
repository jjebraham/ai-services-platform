const axios = require('axios');

// Test script to verify and fix OTP endpoint configuration
async function testAndFixOTPEndpoints() {
  console.log('🔧 OTP Endpoints Fix & Test Script');
  console.log('=' .repeat(50));

  const phoneNumber = '09121958296';
  const testOTP = '128288'; // Known test OTP in mock mode
  const baseURL = 'https://kiani.exchange';

  console.log('📋 Testing Configuration:');
  console.log(`   Phone: ${phoneNumber}`);
  console.log(`   Test OTP: ${testOTP}`);
  console.log(`   Base URL: ${baseURL}`);
  console.log();

  // Test 1: Verify correct /api/auth endpoints work
  console.log('🧪 Test 1: /api/auth endpoints');
  try {
    // Send OTP via correct endpoint
    console.log('   📤 Testing /api/auth/send-otp...');
    const sendResponse = await axios.post(`${baseURL}/api/auth/send-otp`, {
      phoneNumber: phoneNumber
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('   ✅ Send OTP Success:', sendResponse.data);

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify OTP via correct endpoint
    console.log('   🔐 Testing /api/auth/verify-otp...');
    const verifyResponse = await axios.post(`${baseURL}/api/auth/verify-otp`, {
      phoneNumber: phoneNumber,
      otp: testOTP
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('   ✅ Verify OTP Success:', verifyResponse.data);

  } catch (error) {
    console.log('   ❌ /api/auth endpoints error:', error.response?.data || error.message);
  }

  console.log();

  // Test 2: Check if incorrect /api/otp endpoints exist and cause confusion
  console.log('🧪 Test 2: /api/otp endpoints (should be avoided)');
  try {
    // Test incorrect start endpoint
    console.log('   📤 Testing /api/otp/start...');
    const startResponse = await axios.post(`${baseURL}/api/otp/start`, {
      phoneNumber: phoneNumber
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('   ⚠️  /api/otp/start exists (this may cause confusion):', startResponse.data);

    // Wait a moment  
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test incorrect verify endpoint
    console.log('   🔐 Testing /api/otp/verify...');
    const verifyOtpResponse = await axios.post(`${baseURL}/api/otp/verify`, {
      phoneNumber: phoneNumber,
      otp: testOTP
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('   ⚠️  /api/otp/verify exists (this may cause confusion):', verifyOtpResponse.data);

  } catch (error) {
    if (error.response?.status === 404) {
      console.log('   ✅ /api/otp endpoints not found (good - they should not exist)');
    } else {
      console.log('   ❌ /api/otp endpoints error:', error.response?.data || error.message);
    }
  }

  console.log();

  // Test 3: Frontend API client test
  console.log('🧪 Test 3: Frontend API client simulation');
  try {
    // Simulate how the frontend API client works
    const apiClient = {
      baseURL: process.env.VITE_API_URL || 'http://localhost:5002/api',
      post: async (endpoint, data) => {
        const url = `${baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
        console.log(`   📡 API Call: ${url}`);
        return axios.post(url, data, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
      }
    };

    console.log('   🔧 Simulating authAPI.sendOTP...');
    await apiClient.post('/auth/send-otp', { phoneNumber });
    
    console.log('   🔧 Simulating authAPI.verifyOTP...');
    await apiClient.post('/auth/verify-otp', { phoneNumber, otp: testOTP });
    
    console.log('   ✅ Frontend API client simulation successful');

  } catch (error) {
    console.log('   ❌ Frontend API simulation error:', error.response?.data || error.message);
  }

  console.log();
  console.log('📊 Summary & Recommendations:');
  console.log('   1. Use ONLY /api/auth/send-otp and /api/auth/verify-otp');
  console.log('   2. Avoid /api/otp/start and /api/otp/verify endpoints');
  console.log('   3. Check frontend code for any direct fetch/axios calls');
  console.log('   4. Ensure all code uses authAPI from api.js');
  console.log();
  console.log('✅ OTP Endpoint Test Complete');
}

// Run the test
if (require.main === module) {
  testAndFixOTPEndpoints().catch(console.error);
}

module.exports = { testAndFixOTPEndpoints };