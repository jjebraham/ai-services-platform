import dotenv from 'dotenv';
dotenv.config();

import otpService from './otp-service.js';

console.log('=== Local OTP Service Test ===');
console.log('OTP_MOCK env var:', process.env.OTP_MOCK);
console.log('Mock Mode:', otpService.mockMode);
console.log('API Key:', otpService.apiKey ? 'Set' : 'Missing');

// Test sending OTP
console.log('\nTesting sendOTP...');
try {
  const result = await otpService.sendOTP('+989121958296');
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error.message);
}