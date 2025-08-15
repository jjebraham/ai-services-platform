import otpService from './services/otp-service.js';
console.log('=== After Fix ===');
console.log('API Key:', otpService.apiKey ? 'Set' : 'Missing');
console.log('Mock Mode:', otpService.mockMode);
console.log('Use Proxy:', otpService.useProxy);
console.log('Template:', otpService.templateName);
console.log('Proxy Format:', otpService.proxyFmt);
