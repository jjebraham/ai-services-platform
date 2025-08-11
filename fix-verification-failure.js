const axios = require('axios');

// Test the exact OTP verification failure scenario
async function fixVerificationFailure() {
  console.log('🔍 OTP Verification Failure Diagnostic');
  console.log('=' .repeat(50));

  const phoneNumber = '09121958296';
  const baseURL = 'https://kiani.exchange';

  try {
    console.log('📋 Step 1: Send OTP to get session');
    const sendResponse = await axios.post(`${baseURL}/api/auth/send-otp`, {
      phoneNumber: phoneNumber
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Send Response:', sendResponse.data);

    // Wait 2 seconds 
    console.log('⏳ Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📋 Step 2: Check OTP service for stored OTP');
    console.log('OTP_MOCK environment: ' + (process.env.OTP_MOCK || 'not set'));
    
    // Let's test with different OTP values to see what's expected
    const testOTPs = ['128288', '123456', '000000'];
    
    for (const testOTP of testOTPs) {
      try {
        console.log(`\n🔐 Testing OTP: ${testOTP}`);
        const verifyResponse = await axios.post(`${baseURL}/api/auth/verify-otp`, {
          phoneNumber: phoneNumber,
          otp: testOTP
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        });
        
        console.log(`✅ OTP ${testOTP} Success:`, verifyResponse.data);
        break; // If successful, stop testing other OTPs
        
      } catch (error) {
        console.log(`❌ OTP ${testOTP} Failed:`, error.response?.data || error.message);
      }
    }

    console.log('\n📋 Step 3: Direct service test (if available)');
    try {
      // Try to load and test the OTP service directly
      const OTPService = require('./services/otp-service');
      console.log('📦 OTP Service loaded successfully');
      console.log('Mock mode:', OTPService.mockMode);
      
      // Test normalization
      const normalizedPhone = OTPService.normalizePhoneNumber(phoneNumber);
      console.log('Phone normalization:', phoneNumber, '->', normalizedPhone);
      
      // Check if there's any stored OTP
      console.log('OTP Storage size:', OTPService.otpStorage ? OTPService.otpStorage.size : 'N/A');
      
    } catch (serviceError) {
      console.log('❌ Could not load OTP service:', serviceError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  console.log('\n📊 Analysis:');
  console.log('1. Check if OTP service is generating consistent test OTPs in mock mode');
  console.log('2. Verify phone number normalization is consistent');
  console.log('3. Confirm OTP storage/retrieval mechanism works correctly');
  console.log('4. Check for any race conditions in OTP storage');
}

// Run the diagnostic
if (require.main === module) {
  fixVerificationFailure().catch(console.error);
}

module.exports = { fixVerificationFailure };