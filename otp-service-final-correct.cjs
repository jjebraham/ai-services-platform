const axios = require('axios');
// const { HttpsProxyAgent } = require('https-proxy-agent'); // Only needed on remote server
require('dotenv').config();

class OTPServiceFinalCorrect {
  constructor() {
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
    this.mockMode = process.env.OTP_MOCK === '1';
    this.useProxy = process.env.USE_PROXY === '1';
    this.proxyFmt = process.env.PROXY_FMT;
    this.proxyPool = process.env.PROXY_POOL || '1-100';
    
    console.log('Final Correct OTP Service initialized');
    console.log('Mock mode:', this.mockMode);
    console.log('API Key:', this.apiKey ? 'Set' : 'Not set');
    console.log('Template:', this.templateName);
  }

  getRandomProxy() {
    if (!this.useProxy || !this.proxyFmt) return null;
    
    const [min, max] = this.proxyPool.split('-').map(Number);
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.proxyFmt.replace('%d', randomNum);
  }

  async sendOTP(phoneNumber, otpCode) {
    if (this.mockMode) {
      console.log(`[MOCK MODE] OTP ${otpCode} would be sent to ${phoneNumber}`);
      return {
        success: true,
        message: 'OTP sent successfully (mock mode)',
        messageId: 'mock-' + Date.now(),
        otp: otpCode
      };
    }

    console.log(`Sending OTP via Ghasedak correct API to: ${phoneNumber}`);
    console.log(`OTP Code: ${otpCode}`);

    try {
      const requestBody = {
        receptors: [
          {
            mobile: phoneNumber,
            clientReferenceId: 'kiani-' + Date.now()
          }
        ],
        templateName: this.templateName,
        param1: otpCode,
        isVoice: false,
        udh: false
      };

      console.log('Sending request to: https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpWithParams');
      console.log('Request Body:', JSON.stringify(requestBody));

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': this.apiKey
        },
        timeout: 15000
      };

      // Add proxy if enabled
      if (this.useProxy) {
        const proxyUrl = this.getRandomProxy();
        if (proxyUrl) {
          console.log('Using proxy:', proxyUrl);
          // config.httpsAgent = new HttpsProxyAgent(proxyUrl); // Only on remote server
          // Disable SSL verification for proxy
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        }
      }

      const response = await axios.post(
        'https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpWithParams',
        requestBody,
        config
      );

      console.log('✅ OTP sent successfully!');
      console.log('Response:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.isSuccess) {
        const item = response.data.data.items[0];
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: item.messageId,
          cost: item.cost,
          otp: otpCode
        };
      } else {
        throw new Error('Unexpected response structure');
      }

    } catch (error) {
      console.error('OTP Send Error:', error.message);
      
      const result = {
        success: false,
        error: error.message,
        otp: otpCode
      };

      if (error.response) {
        console.error('Error Response:', error.response.data);
        result.statusCode = error.response.status;
        result.responseData = error.response.data;
      }

      console.log('OTP Send Result:', JSON.stringify(result, null, 2));
      return result;
    }
  }
}

module.exports = OTPServiceFinalCorrect;