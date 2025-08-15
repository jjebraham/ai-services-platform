const axios = require('axios');
const OTPService = require('./services/otp-service');

// Diagnostic test for OTP verification failure
async function debugOTPIssue() {
  console.log('🔍 OTP Verification Debug');
  console.log('=' .repeat(50));

  const phoneNumber = '09121958296';
  const baseURL = 'http://localhost:5000';

  // Step 1: Check environment variables
  console.log('\n📋 Step 1: Environment Check');
  console.log('OTP_MOCK:', process.env.OTP_MOCK || 'not set');
  console.log('OTP_TTL_SECONDS:', process.env.OTP_TTL_SECONDS || 'not set');
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'not set');
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'set' : 'not set');
  
  // Step 2: Check OTP service configuration
  console.log('\n📋 Step 2: OTP Service Configuration');
  console.log('Mock Mode:', OTPService.mockMode);
  console.log('OTP TTL:', OTPService.otpTTL);
  console.log('Storage Size:', OTPService.otpStorage.size);
  
  // Step 3: Test phone normalization
  console.log('\n📋 Step 3: Phone Normalization Test');
  const normalizedPhone = OTPService.normalizePhoneNumber(phoneNumber);
  console.log('Original:', phoneNumber);
  console.log('Normalized:', normalizedPhone);

  try {
    // Step 4: Send OTP request
    console.log('\n📋 Step 4: Send OTP Request');
    const sendResponse = await axios.post(`${baseURL}/api/auth/send-otp`, {
      phoneNumber: phoneNumber
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Send OTP Response:', sendResponse.data);
    
    // Step 5: Check OTP storage after send
    console.log('\n📋 Step 5: OTP Storage After Send');
    console.log('Storage Size:', OTPService.otpStorage.size);
    console.log('Storage Keys:', Array.from(OTPService.otpStorage.keys()));
    
    const otpStatus = OTPService.getOTPStatus(phoneNumber);
    console.log('OTP Status:', otpStatus);
    
    // Step 6: Generate expected OTP
    console.log('\n📋 Step 6: Generate Expected OTP');
    const expectedOTP = OTPService.generateOTP();
    console.log('Expected OTP (from service):', expectedOTP);
    
    // Step 7: Direct OTP verification test
    console.log('\n📋 Step 7: Direct OTP Verification Test');
    const directVerifyResult = OTPService.verifyOTP(phoneNumber, '128288');
    console.log('Direct verification result:', directVerifyResult);
    
    // Wait 2 seconds before API verification
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 8: API OTP verification test
    console.log('\n📋 Step 8: API OTP Verification Test');
    const verifyResponse = await axios.post(`${baseURL}/api/auth/verify-otp`, {
      phoneNumber: phoneNumber,
      otp: '128288'
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    
    console.log('✅ Verify OTP Response:', verifyResponse.data);

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
      console.error('Status:', error.response.status);
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  // Step 9: Final storage check
  console.log('\n📋 Step 9: Final Storage Check');
  console.log('Storage Size:', OTPService.otpStorage.size);
  console.log('Storage Contents:');
  for (const [key, value] of OTPService.otpStorage.entries()) {
    console.log(`  ${key}:`, {
      otp: value.otp,
      expiresAt: new Date(value.expiresAt).toISOString(),
      attempts: value.attempts,
      isExpired: Date.now() > value.expiresAt
    });
  }
}

// Set mock mode for testing
process.env.OTP_MOCK = '1';
process.env.OTP_TTL_SECONDS = '300';

// Run the diagnostic
if (require.main === module) {
  debugOTPIssue().catch(console.error);
}

module.exports = { debugOTPIssue };