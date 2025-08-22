require('dotenv').config();
const otpService = require('./services/otp-service.js');
console.log('=== OTP Service Debug ===');
console.log('API Key:', otpService.apiKey ? 'Set' : 'Missing');
console.log('Mock Mode:', otpService.mockMode);
console.log('Use Proxy:', otpService.useProxy);
console.log('Template:', otpService.templateName);
console.log('=== Testing SMS ===');
if (otpService.apiKey) {
  console.log('API Key is available, attempting SMS test...');
} else {
  console.log('API Key is missing!');
}
