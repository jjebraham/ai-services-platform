const OTPServiceFinalCorrect = require('./otp-service-final-correct.cjs');

async function testFinalCorrectOTP() {
  console.log('Testing Final Correct OTP Service...');
  
  const otpService = new OTPServiceFinalCorrect();
  
  const phoneNumber = '09121958296';
  const otpCode = '789012';
  
  console.log(`Testing with phone: ${phoneNumber}, OTP: ${otpCode}`);
  
  try {
    const result = await otpService.sendOTP(phoneNumber, otpCode);
    console.log('Final Test Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ OTP service is working correctly!');
    } else {
      console.log('❌ OTP service failed');
    }
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

testFinalCorrectOTP();