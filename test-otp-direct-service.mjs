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
    // Test 1: Check account info
    console.log('\n1. Testing account info...');
    const accountInfo = await otpService.sendSMS('09121958296', 'Test account check', 0);
    console.log('Account info result:', accountInfo);

    // Test 2: Send OTP
    console.log('\n2. Testing OTP sending...');
    const otpResult = await otpService.sendOTP('09121958296');
    console.log('OTP send result:', otpResult);

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOTPServices();
