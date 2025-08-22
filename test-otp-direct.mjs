import dotenv from 'dotenv';
dotenv.config();
import otpService from './services/otp-service.js';
console.log('=== OTP Service Debug ===');
console.log('API Key:', otpService.apiKey ? 'Set' : 'Missing');
console.log('Mock Mode:', otpService.mockMode);
console.log('Use Proxy:', otpService.useProxy);
console.log('Template:', otpService.templateName);
console.log('=== Testing SMS ===');
if (otpService.apiKey) {
  console.log('API Key is available, attempting SMS test...');
  try {
    const result = await otpService.requestOTP('09121958296');
    console.log('SMS Result:', result);
  } catch (error) {
    console.error('SMS Error:', error.message);
  }
} else {
  console.log('API Key is missing!');
}
