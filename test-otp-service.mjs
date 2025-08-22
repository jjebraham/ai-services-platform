import dotenv from 'dotenv';
import { OTPService } from './services/otp-service.js';

dotenv.config();

console.log('=== Testing OTP Service with Proxy ===');
console.log('API Key exists:', !!process.env.GHASEDAK_API_KEY);
console.log('Proxy enabled:', process.env.USE_PROXY === '1');
console.log('Proxy format:', process.env.PROXY_FMT);
console.log('Proxy pool:', process.env.PROXY_POOL);

const otpService = new OTPService();

async function testOTPServices() {
  try {
    // Test 1: Send OTP
    console.log('\n1. Testing OTP sending...');
    const otpResult = await otpService.sendOTP('09121958296');
    console.log('OTP send result:', otpResult);

    // Test 2: Verify OTP (if we get a successful send)
    if (otpResult && otpResult.success) {
      console.log('\n2. Testing OTP verification...');
      // Note: This would need the actual OTP from the SMS
      // const verifyResult = await otpService.verifyOTP('09121958296', '123456');
      // console.log('OTP verify result:', verifyResult);
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testOTPServices();
