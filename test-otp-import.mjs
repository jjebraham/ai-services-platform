import otpService from './services/otp-service.js';
console.log('OTP Service loaded:', typeof otpService);
console.log('OTP Service methods:', Object.getOwnPropertyNames(otpService));

// Test requestOTP method
try {
  const result = await otpService.requestOTP('09121958296');
  console.log('OTP Request result:', result);
} catch (error) {
  console.error('OTP Request error:', error.message);
}