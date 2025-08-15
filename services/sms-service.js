import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

class SMSService {
  constructor() {
    // Try Kavenegar as alternative SMS provider
    this.kavenegarApiKey = '6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B6B';
    this.ghasedakApiKey = process.env.GHASEDAK_API_KEY;
    this.template = process.env.GHASEDAK_TEMPLATE_NAME || 'verify';
    this.proxyEnabled = process.env.USE_PROXY === '1';
    this.mockMode = process.env.OTP_MOCK === '1';
    
    // Ghasedak client
    this.ghasedakClient = axios.create({
      baseURL: 'https://api.ghasedak.me/v2',
      timeout: parseInt(process.env.READ_TIMEOUT) * 1000 || 30000,
      headers: {
        'apikey': this.ghasedakApiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Kavenegar client
    this.kavenegarClient = axios.create({
      baseURL: 'https://api.kavenegar.com/v1',
      timeout: parseInt(process.env.READ_TIMEOUT) * 1000 || 30000
    });
  }

  async sendOTP(phone, code) {
    // Mock mode for testing
    if (this.mockMode) {
      console.log(`[MOCK SMS] Sending OTP ${code} to ${phone}`);
      return {
        success: true,
        reference: 'mock-' + Date.now()
      };
    }

    // Try Kavenegar first
    try {
      const result = await this.sendViaKavenegar(phone, code);
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.log('Kavenegar failed, trying Ghasedak:', error.message);
    }

    // Fallback to Ghasedak
    return await this.sendViaGhasedak(phone, code);
  }

  async sendViaKavenegar(phone, code) {
    const message = `کد تایید شما: ${code}`;
    
    try {
      const response = await this.kavenegarClient.get(
        `/${this.kavenegarApiKey}/sms/send.json`,
        {
          params: {
            receptor: phone,
            message: message,
            sender: '10008663'
          }
        }
      );
      
      return {
        success: response.data.return.status === 200,
        reference: response.data.entries[0].messageid
      };
    } catch (error) {
      console.error('Kavenegar API error:', error.response?.data);
      return { success: false, error: error.message };
    }
  }

  async sendViaGhasedak(phone, code) {
    const payload = new URLSearchParams({
      receptor: phone,
      template: this.template,
      type: '2',
      param1: code,
      checkid: code
    });

    const config = this.proxyEnabled ? {
      httpsAgent: new HttpsProxyAgent({
        host: '59.152.60.100',
        port: 6040,
        auth: `jjebraham-${this.getRandomProxy()}:Amir1234`
      })
    } : {};

    try {
      const response = await this.ghasedakClient.post('/verification/send/simple', 
        payload.toString(), config);
      
      return {
        success: response.data.result.code === 200,
        reference: response.data.items[0].reference
      };
    } catch (error) {
      console.error('Ghasedak API error:', error.response?.data);
      return { success: false, error: error.message };
    }
  }

  getRandomProxy() {
    const [min, max] = process.env.PROXY_POOL.split('-').map(Number);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export default new SMSService();