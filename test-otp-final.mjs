import dotenv from 'dotenv';
import OTPService from './services/otp-service.js';

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

    // Test 2: Check if we have stored OTP
    console.log('\n2. Checking OTP store...');
    console.log('OTP store size:', otpService.otpStore.size);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.error('Full error:', error);
  }
}

testOTPServices();
