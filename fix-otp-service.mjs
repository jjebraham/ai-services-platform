import dotenv from 'dotenv';
dotenv.config();

// Re-create the OTP service with fresh environment variables
import OTPService from './services/otp-service.js';
console.log('Original OTP Service:');
console.log('API Key:', OTPService.apiKey ? 'Set' : 'Missing');
console.log('Mock Mode:', OTPService.mockMode);
console.log('Use Proxy:', OTPService.useProxy);

// Create a new instance to test
class TestOTPService {
  constructor() {
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
    this.mockMode = process.env.OTP_MOCK === '1';
    this.useProxy = process.env.USE_PROXY === '1';
    this.proxyFmt = process.env.PROXY_FMT;
  }
}

const testService = new TestOTPService();
console.log('\\n=== Test Service with Fresh Env ===');
console.log('API Key:', testService.apiKey ? 'Set' : 'Missing');
console.log('Mock Mode:', testService.mockMode);
console.log('Use Proxy:', testService.useProxy);
