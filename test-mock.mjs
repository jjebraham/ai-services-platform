import './services/otp-service.js';
import otpService from './services/otp-service.js';

console.log('Testing mock mode...');
console.log('Mock mode:', process.env.OTP_MOCK);

otpService.sendOTP('09121958296')
  .then(r => console.log('Mock result:', JSON.stringify(r)))
  .catch(e => console.log('Error:', e.message));
