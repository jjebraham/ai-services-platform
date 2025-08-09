import('./services/otp-service.js').then(module => {
  const otpService = module.default;
  
  console.log('=== Testing SMS Directly ===');
  console.log('Mock Mode:', otpService.mockMode);
  console.log('API Key:', otpService.apiKey ? 'Set' : 'Missing');
  console.log('Use Proxy:', otpService.useProxy);
  console.log('Proxy Format:', otpService.proxyFmt);
  
  if (otpService.apiKey) {
    otpService.requestOTP('09121958296')
      .then(result => console.log('SMS Result:', result))
      .catch(error => console.error('SMS Error:', error.message));
  } else {
    console.error('API Key is missing!');
  }
});
