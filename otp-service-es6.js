import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class OTPService {
  constructor() {
    this.otpStorage = new Map();
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'kiani-otp';
    this.otpTTL = parseInt(process.env.OTP_TTL_SECONDS) || 300; // 5 minutes
    this.mockMode = process.env.OTP_MOCK === '1';
    this.useProxy = process.env.USE_PROXY === '1';
    this.proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:8080';
    this.maxRetry = parseInt(process.env.MAX_RETRY) || 3;
    this.pauseBase = parseInt(process.env.PAUSE_BASE) || 1000;
    this.connectTimeout = parseInt(process.env.CONNECT_TIMEOUT) || 10000;
    this.readTimeout = parseInt(process.env.READ_TIMEOUT) || 30000;
    
    console.log('OTPService initialized with proxy:', this.useProxy ? this.proxyUrl : 'disabled');
  }

  normalizePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Iranian phone numbers
    if (cleaned.startsWith('0098')) {
      cleaned = cleaned.substring(4);
    } else if (cleaned.startsWith('98')) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // Add country code for Iranian numbers
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      cleaned = '98' + cleaned;
    }
    
    return cleaned;
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getProxyConfig() {
    if (!this.useProxy) return {};
    
    console.log('Using proxy configuration:', this.proxyUrl);
    const [protocol, rest] = this.proxyUrl.split('://');
    const [hostPort] = rest.split('/');
    const [host, port] = hostPort.split(':');
    
    return {
      proxy: {
        protocol: protocol,
        host: host,
        port: parseInt(port) || 8080
      }
    };
  }

  async sendSMS(phoneNumber, message, templateName = null) {
    if (this.mockMode) {
      console.log(`[MOCK] SMS to ${phoneNumber}: ${message}`);
      return { success: true, mock: true };
    }

    const url = 'https://api.ghasedak.me/v2/sms/send';
    const data = {
      message: message,
      receptor: phoneNumber,
      linenumber: process.env.GHASEDAK_LINE_NUMBER || '10008566',
      template: templateName || this.templateName
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey': this.apiKey
    };

    const axiosConfig = {
      method: 'POST',
      url: url,
      headers: headers,
      data: new URLSearchParams(data).toString(),
      timeout: this.readTimeout,
      ...this.getProxyConfig()
    };

    console.log('Sending SMS with config:', {
      url,
      receptor: phoneNumber,
      template: templateName || this.templateName,
      proxy: this.useProxy ? this.proxyUrl : 'disabled'
    });

    for (let attempt = 1; attempt <= this.maxRetry; attempt++) {
      try {
        const response = await axios(axiosConfig);
        
        if (response.data && response.data.result) {
          console.log('SMS sent successfully:', response.data);
          return { success: true, data: response.data };
        } else {
          console.log('SMS API returned unexpected response:', response.data);
          return { success: false, error: 'Unexpected API response', data: response.data };
        }
      } catch (error) {
        console.log(`SMS attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.maxRetry) {
          return { success: false, error: error.message };
        }
        
        // Exponential backoff
        const delay = this.pauseBase * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async sendOTP(phoneNumber) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const otp = this.generateOTP();
    const expiresAt = Date.now() + (this.otpTTL * 1000);
    
    // Store OTP
    this.otpStorage.set(normalizedPhone, {
      code: otp,
      expiresAt: expiresAt,
      attempts: 0,
      maxAttempts: 3
    });
    
    console.log(`Generated OTP ${otp} for ${normalizedPhone}, expires at ${new Date(expiresAt)}`);
    
    // Send SMS
    const message = `کد تایید شما: ${otp}`;
    const smsResult = await this.sendSMS(normalizedPhone, message);
    
    if (smsResult.success) {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      // Remove OTP from storage if SMS failed
      this.otpStorage.delete(normalizedPhone);
      return { success: false, error: 'Failed to send SMS: ' + smsResult.error };
    }
  }

  async verifyOTP(phoneNumber, code) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const storedOTP = this.otpStorage.get(normalizedPhone);
    
    if (!storedOTP) {
      return { success: false, error: 'OTP not found or expired' };
    }
    
    // Check if OTP is expired
    if (Date.now() > storedOTP.expiresAt) {
      this.otpStorage.delete(normalizedPhone);
      return { success: false, error: 'OTP expired' };
    }
    
    // Check attempts
    if (storedOTP.attempts >= storedOTP.maxAttempts) {
      this.otpStorage.delete(normalizedPhone);
      return { success: false, error: 'Too many attempts' };
    }
    
    // Increment attempts
    storedOTP.attempts++;
    
    // Verify code
    if (storedOTP.code === code) {
      this.otpStorage.delete(normalizedPhone);
      return { success: true, message: 'OTP verified successfully' };
    } else {
      return { success: false, error: 'Invalid OTP code' };
    }
  }

  // Clean up expired OTPs periodically
  startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      for (const [phone, otp] of this.otpStorage.entries()) {
        if (now > otp.expiresAt) {
          this.otpStorage.delete(phone);
          console.log(`Cleaned up expired OTP for ${phone}`);
        }
      }
    }, 60000); // Clean up every minute
  }
}

// Create and export singleton instance
const otpService = new OTPService();
otpService.startCleanupTimer();

export default otpService;