const otpService = require('./services/otp-service.js');

async function diagnoseOTP() {
  console.log('=== OTP Service Diagnostics ===');
  
  console.log('Mock Mode:', otpService.mockMode);
  console.log('Use Proxy:', otpService.useProxy);
  console.log('Proxy Format:', otpService.proxyFmt);
  console.log('Proxy Pool:', otpService.proxyPool);
  console.log('API Key:', otpService.apiKey ? 'Configured' : 'Missing');
  console.log('Template:', otpService.templateName);
  
  // Test proxy configuration
  if (otpService.useProxy) {
    console.log('\n=== Testing Proxy Configuration ===');
    try {
      const proxy = otpService.getProxyConfig();
      console.log('Proxy Config:', proxy);
    } catch (error) {
      console.error('Proxy Config Error:', error.message);
    }
  }
  
  // Test actual SMS sending
  console.log('\n=== Testing SMS Send ===');
  try {
    const result = await otpService.requestOTP('09121958296');
    console.log('SMS Result:', result);
  } catch (error) {
    console.error('SMS Error:', error.message);
  }
}

diagnoseOTP();
