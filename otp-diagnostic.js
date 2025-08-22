const OTPService = require('./services/otp-service');

// Test OTP functionality
async function diagnoseOTP() {
  console.log('=== OTP Service Diagnostic ===');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('OTP_MOCK:', process.env.OTP_MOCK);
  console.log('GHASEDAK_API_KEY:', process.env.GHASEDAK_API_KEY ? 'Set' : 'Missing');
  console.log('OTP_TTL_SECONDS:', process.env.OTP_TTL_SECONDS);
  console.log('');

  // Initialize OTP service
  const otpService = new OTPService();
  
  console.log('OTP Service Configuration:');
  console.log('Mock Mode:', otpService.mockMode);
  console.log('API Key Available:', !!otpService.apiKey);
  console.log('OTP TTL:', otpService.otpTTL, 'seconds');
  console.log('');

  // Test phone number normalization
  const testPhone = '09121958296';
  const normalized = otpService.normalizePhoneNumber ? otpService.normalizePhoneNumber(testPhone) : testPhone;
  console.log('Phone Normalization:', testPhone, '->', normalized);
  console.log('');

  // Test OTP generation and verification
  try {
    console.log('Testing OTP flow...');
    
    // Request OTP
    console.log('1. Requesting OTP...');
    const requestResult = await otpService.requestOTP(testPhone);
    console.log('Request Result:', requestResult);
    
    if (requestResult.success) {
      console.log('✅ OTP request successful');
      
      // For testing, let's verify with the stored OTP
      const storedOTP = otpService.otpStorage.get(normalized);
      if (storedOTP) {
        console.log('Stored OTP:', storedOTP.otp);
        
        // Verify OTP
        console.log('2. Verifying OTP...');
        const verifyResult = otpService.verifyOTP(testPhone, storedOTP.otp);
        console.log('Verify Result:', verifyResult);
        
        if (verifyResult.success) {
          console.log('✅ OTP verification successful');
        } else {
          console.log('❌ OTP verification failed:', verifyResult.error);
        }
      }
    } else {
      console.log('❌ OTP request failed:', requestResult.error);
    }
    
  } catch (error) {
    console.error('❌ Error during OTP test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run diagnostic
if (require.main === module) {
  diagnoseOTP().catch(console.error);
}

module.exports = { diagnoseOTP };