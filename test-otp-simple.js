const otpService = require('./services/otp-service.js');
console.log('Testing OTP service...');
console.log('Mock mode:', process.env.OTP_MOCK);
console.log('API Key:', process.env.GHASEDAK_API_KEY ? 'Set' : 'Missing');

otpService.sendOTP('09121958296')
  .then(r => console.log('Success:', JSON.stringify(r)))
  .catch(e => console.log('Error:', e.message));
