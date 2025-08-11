const axios = require('axios');
const crypto = require('crypto');
const { HttpsProxyAgent } = require('https-proxy-agent');

class OTPService {
  constructor() {
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
    this.baseURL = 'https://gateway.ghasedak.me/rest/api/v1/WebService';
    this.otpTTL = parseInt(process.env.OTP_TTL_SECONDS) || 300; // 5 minutes
    this.mockMode = process.env.OTP_MOCK === '1';
    this.useProxy = process.env.USE_PROXY === '1';
    this.proxyFmt = process.env.PROXY_FMT || process.env.PROXY_URL; // support fixed PROXY_URL
    this.proxyPool = process.env.PROXY_POOL || '1-100';
    this.maxRetry = parseInt(process.env.MAX_RETRY) || 5;
    this.pauseBase = parseFloat(process.env.PAUSE_BASE) || 1.0;
    this.connectTimeout = parseInt(process.env.CONNECT_TIMEOUT) || 20;
    this.readTimeout = parseInt(process.env.READ_TIMEOUT) || 30;
    
    // In-memory storage for OTPs (in production, use Redis or database)
    this.otpStorage = new Map();
    
    // Clean up expired OTPs every minute
    setInterval(() => {
      this.cleanupExpiredOTPs();
    }, 60000);
  }

  // Generate a random 6-digit OTP
  generateOTP() {
    // In mock mode, always return the test OTP for consistent testing
    if (this.mockMode) {
      return '128288';
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get proxy configuration
  getProxyConfig() {
    if (!this.useProxy || !this.proxyFmt) return null;
    
    let proxyUrl = this.proxyFmt;
    
    // Check if it's a pool format with {n} placeholder
    if (proxyUrl.includes('{n}')) {
      const [min, max] = this.proxyPool.split('-').map(Number);
      const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      proxyUrl = proxyUrl.replace('{n}', randomNum);
    }
    
    try {
      const url = new URL(proxyUrl);
      const proxyConfig = {
        host: url.hostname,
        port: parseInt(url.port) || 80,
        auth: {
          username: url.username,
          password: url.password
        },
        protocol: url.protocol.replace(':','')
      };
      console.log(`Using proxy: ${url.protocol}//${url.username ? url.username + ':' : ''}***@${url.hostname}:${url.port || 80}`);
      return { proxyUrl, proxyConfig };
    } catch (error) {
      console.error('Invalid proxy format:', error.message);
      return null;
    }
  }

  // Create axios instance with retry logic
  createAxiosInstance() {
    const config = {
      baseURL: this.baseURL,
      timeout: this.connectTimeout * 1000,
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': this.apiKey
      }
    };

    const proxyInfo = this.getProxyConfig();
    if (proxyInfo) {
      // Use HTTPS proxy agent for HTTPS target via HTTP proxy
      try {
        const agent = new HttpsProxyAgent(proxyInfo.proxyUrl);
        config.httpsAgent = agent;
        // Disable strict TLS verification when going through proxy to avoid EPROTO
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      } catch (e) {
        console.error('Failed to create HttpsProxyAgent:', e.message);
      }
    }

    return axios.create(config);
  }

  // Send OTP via Ghasedak API
  async sendOTP(phoneNumber, otp, retryCount = 0) {
    if (this.mockMode) {
      console.log(`[MOCK MODE] OTP ${otp} would be sent to ${phoneNumber}`);
      return {
        success: true,
        message: 'OTP sent successfully (mock mode)',
        messageId: 'mock-' + Date.now()
      };
    }

    if (!this.apiKey) {
      throw new Error('Ghasedak API key not configured');
    }

    try {
      const axiosInstance = this.createAxiosInstance();
      
      const requestBody = {
        receptors: [
          {
            mobile: phoneNumber,
            clientReferenceId: 'kiani-' + Date.now()
          }
        ],
        templateName: this.templateName,
        param1: otp,
        isVoice: false,
        udh: false
      };

      const response = await axiosInstance.post('/SendOtpWithParams', requestBody);

      if (response.data && response.data.isSuccess) {
        const item = response.data.data.items[0];
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: item.messageId,
          cost: item.cost
        };
      } else {
        throw new Error('Invalid response from Ghasedak API');
      }

    } catch (error) {
      console.error(`OTP send attempt ${retryCount + 1} failed:`, error.message);
      
      if (retryCount < this.maxRetry - 1) {
        // Wait before retry
        const delay = this.pauseBase * Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.sendOTP(phoneNumber, otp, retryCount + 1);
      }
      
      throw new Error(`Failed to send OTP after ${this.maxRetry} attempts: ${error.message}`);
    }
  }

  // Store OTP for verification
  storeOTP(phoneNumber, otp) {
    const key = this.normalizePhoneNumber(phoneNumber);
    const expiresAt = Date.now() + (this.otpTTL * 1000);
    
    this.otpStorage.set(key, {
      otp,
      expiresAt,
      attempts: 0
    });
  }

  // Verify OTP
  verifyOTP(phoneNumber, providedOTP) {
    const key = this.normalizePhoneNumber(phoneNumber);
    const stored = this.otpStorage.get(key);
    
    if (!stored) {
      return {
        success: false,
        error: 'OTP not found or expired'
      };
    }
    
    if (Date.now() > stored.expiresAt) {
      this.otpStorage.delete(key);
      return {
        success: false,
        error: 'OTP has expired'
      };
    }
    
    stored.attempts++;
    
    if (stored.attempts > 3) {
      this.otpStorage.delete(key);
      return {
        success: false,
        error: 'Too many verification attempts'
      };
    }
    
    if (stored.otp === providedOTP) {
      this.otpStorage.delete(key);
      return {
        success: true,
        message: 'OTP verified successfully'
      };
    }
    
    return {
      success: false,
      error: 'Invalid OTP'
    };
  }

  // Send OTP to phone number
  async requestOTP(phoneNumber) {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Check if OTP was recently sent (rate limiting)
      const existing = this.otpStorage.get(normalizedPhone);
      if (existing && (Date.now() - (existing.expiresAt - this.otpTTL * 1000)) < 60000) {
        return {
          success: false,
          error: 'Please wait before requesting another OTP'
        };
      }
      
      const otp = this.generateOTP();
      const result = await this.sendOTP(normalizedPhone, otp);
      
      if (result.success) {
        this.storeOTP(normalizedPhone, otp);
        return {
          success: true,
          message: 'OTP sent successfully',
          expiresIn: this.otpTTL
        };
      }
      
      return result;
      
    } catch (error) {
      console.error('OTP request failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP'
      };
    }
  }

  // Normalize phone number format
  normalizePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let normalized = phoneNumber.replace(/\D/g, '');
    
    // Add country code if missing (assuming Iran +98)
    if (normalized.length === 10 && normalized.startsWith('9')) {
      normalized = '98' + normalized;
    } else if (normalized.length === 11 && normalized.startsWith('09')) {
      normalized = '98' + normalized.substring(1);
    }
    
    return normalized;
  }

  // Clean up expired OTPs
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [key, value] of this.otpStorage.entries()) {
      if (now > value.expiresAt) {
        this.otpStorage.delete(key);
      }
    }
  }

  // Get OTP status for debugging
  getOTPStatus(phoneNumber) {
    const key = this.normalizePhoneNumber(phoneNumber);
    const stored = this.otpStorage.get(key);
    
    if (!stored) {
      return { exists: false };
    }
    
    return {
      exists: true,
      expiresAt: stored.expiresAt,
      attempts: stored.attempts,
      isExpired: Date.now() > stored.expiresAt
    };
  }
}

module.exports = new OTPService();