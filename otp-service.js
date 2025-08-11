const axios = require('axios');
const crypto = require('crypto');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis or database
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
    this.ttlSeconds = parseInt(process.env.OTP_TTL_SECONDS) || 300;
    this.mockMode = process.env.OTP_MOCK === '1';
    this.useProxy = process.env.USE_PROXY === '1';
    this.proxyFmt = process.env.PROXY_FMT;
    this.proxyPool = process.env.PROXY_POOL || '1-100';
    this.maxRetry = parseInt(process.env.MAX_RETRY) || 5;
    this.pauseBase = parseFloat(process.env.PAUSE_BASE) || 1.0;
    this.connectTimeout = parseInt(process.env.CONNECT_TIMEOUT) || 20;
    this.readTimeout = parseInt(process.env.READ_TIMEOUT) || 30;
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getProxyConfig() {
    if (!this.useProxy || !this.proxyFmt) {
      return null;
    }

    const [start, end] = this.proxyPool.split('-').map(Number);
    const randomNum = Math.floor(Math.random() * (end - start + 1)) + start;
    const proxyUrl = this.proxyFmt.replace('{n}', randomNum);
    
    // Parse proxy URL
    const proxyMatch = proxyUrl.match(/http:\/\/(.*?):(.*?)@(.*?):(\d+)/);
    if (proxyMatch) {
      return {
        host: proxyMatch[3],
        port: parseInt(proxyMatch[4]),
        auth: {
          username: proxyMatch[1],
          password: proxyMatch[2]
        }
      };
    }
    
    return null;
  }

  async sendSMS(phoneNumber, message, retryCount = 0) {
    if (this.mockMode) {
      console.log(`[MOCK] SMS to ${phoneNumber}: ${message}`);
      return { success: true, messageId: 'mock-' + Date.now() };
    }

    try {
      const config = {
        method: 'post',
        url: 'https://api.ghasedak.me/v2/sms/send/simple',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          message: message,
          receptor: phoneNumber,
          linenumber: '10008566',
          senddate: '',
          checkid: crypto.randomUUID()
        }),
        timeout: this.connectTimeout * 1000
      };

      // Add proxy if configured
      const proxyConfig = this.getProxyConfig();
      if (proxyConfig) {
        config.proxy = proxyConfig;
      }

      const response = await axios(config);
      
      if (response.data && response.data.result && response.data.result.code === 200) {
        return {
          success: true,
          messageId: response.data.result.items[0]?.messageid || 'unknown'
        };
      } else {
        throw new Error(`Ghasedak API error: ${response.data?.result?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`SMS send attempt ${retryCount + 1} failed:`, error.message);
      
      if (retryCount < this.maxRetry - 1) {
        const delay = this.pauseBase * Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendSMS(phoneNumber, message, retryCount + 1);
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  async sendOTP(phoneNumber) {
    try {
      // Normalize phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Generate OTP
      const otp = this.generateOTP();
      
      // Store OTP with expiration
      const otpData = {
        otp,
        phoneNumber: normalizedPhone,
        createdAt: Date.now(),
        expiresAt: Date.now() + (this.ttlSeconds * 1000),
        attempts: 0
      };
      
      this.otpStore.set(normalizedPhone, otpData);
      
      // Send SMS
      const message = `کد تایید شما: ${otp}\nاین کد تا ${this.ttlSeconds / 60} دقیقه معتبر است.`;
      const result = await this.sendSMS(normalizedPhone, message);
      
      if (result.success) {
        return {
          success: true,
          message: 'OTP sent successfully',
          expiresIn: this.ttlSeconds
        };
      } else {
        // Remove from store if SMS failed
        this.otpStore.delete(normalizedPhone);
        return {
          success: false,
          error: result.error || 'Failed to send OTP'
        };
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP'
      };
    }
  }

  async verifyOTP(phoneNumber, otp) {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      const otpData = this.otpStore.get(normalizedPhone);
      
      if (!otpData) {
        return {
          success: false,
          error: 'OTP not found or expired'
        };
      }
      
      // Check expiration
      if (Date.now() > otpData.expiresAt) {
        this.otpStore.delete(normalizedPhone);
        return {
          success: false,
          error: 'OTP has expired'
        };
      }
      
      // Increment attempts
      otpData.attempts++;
      
      // Check max attempts (prevent brute force)
      if (otpData.attempts > 5) {
        this.otpStore.delete(normalizedPhone);
        return {
          success: false,
          error: 'Too many attempts. Please request a new OTP.'
        };
      }
      
      // Verify OTP
      if (otpData.otp === otp) {
        // Remove from store after successful verification
        this.otpStore.delete(normalizedPhone);
        return {
          success: true,
          phoneNumber: normalizedPhone
        };
      } else {
        return {
          success: false,
          error: 'Invalid OTP'
        };
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify OTP'
      };
    }
  }

  normalizePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let normalized = phoneNumber.replace(/\D/g, '');
    
    // Handle Iranian phone numbers
    if (normalized.startsWith('0')) {
      normalized = '98' + normalized.substring(1);
    } else if (normalized.startsWith('98')) {
      // Already normalized
    } else if (normalized.startsWith('9')) {
      normalized = '98' + normalized;
    }
    
    return normalized;
  }

  // Cleanup expired OTPs (call this periodically)
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [phone, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(phone);
      }
    }
  }
}

module.exports = new OTPService();