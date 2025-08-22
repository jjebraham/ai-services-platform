const OTPServiceRemoteCorrect = require('./otp-service-remote-correct.cjs');

async function testRemoteCorrectOTP() {
  console.log('Testing Remote Correct OTP Service...');
  
  const otpService = new OTPServiceRemoteCorrect();
  
  const phoneNumber = '09121958296';
  const otpCode = '456789';
  
  console.log(`Testing with phone: ${phoneNumber}, OTP: ${otpCode}`);
  
  try {
    const result = await otpService.sendOTP(phoneNumber, otpCode);
    console.log('Remote Test Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Remote OTP service is working correctly!');
    } else {
      console.log('❌ Remote OTP service failed');
    }
  } catch (error) {
    console.error('Test Error:', error.message);
  }
}

testRemoteCorrectOTP();