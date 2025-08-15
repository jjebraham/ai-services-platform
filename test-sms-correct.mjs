import otpService from './services/otp-service.js';
console.log('=== Testing SMS with Correct Method ===');
console.log('API Key:', otpService.apiKey ? 'Set' : 'Missing');
console.log('Use Proxy:', otpService.useProxy);
console.log('Proxy Format:', otpService.proxyFmt);
console.log('Template:', otpService.templateName);

console.log('\\nSending OTP to 09121958296...');
try {
  const result = await otpService.sendOTP('09121958296');
  console.log('SMS Result:', result);
} catch (error) {
  console.error('SMS Error:', error.message);
  console.error('Stack:', error.stack);
}
