const axios = require('axios');
const crypto = require('crypto');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In production, use Redis or database
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
    this.ttlSeconds = parseInt(process.env.OTP_TTL_SECONDS) || 300;
    this.mockMode = process.env.OTP_MOCK === '1';
    
    // Proxy configuration - always use proxy for Ghasedak API
    this.useProxy = true;
    this.proxyUrl = process.env.PROXY_URL || 'http://jjebraham-12:Amir1234@p.webshare.io:80';
    
    this.maxRetry = parseInt(process.env.MAX_RETRY) || 3;
    this.pauseBase = parseFloat(process.env.PAUSE_BASE) || 1.0;
    this.connectTimeout = parseInt(process.env.CONNECT_TIMEOUT) || 30;
    this.readTimeout = parseInt(process.env.READ_TIMEOUT) || 30;

    // Debug logging
    console.log('[OTP Service] Initialized with:');
    console.log('[OTP Service] Mock Mode:', this.mockMode);
    console.log('[OTP Service] API Key:', this.apiKey ? 'Set' : 'Missing');
    console.log('[OTP Service] Proxy URL:', this.proxyUrl ? 'Set' : 'Missing');
    console.log('[OTP Service] Template:', this.templateName);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getProxyConfig() {
    if (!this.useProxy || !this.proxyUrl) {
      return null;
    }

    // Parse proxy URL: http://username:password@host:port
    const proxyMatch = this.proxyUrl.match(/^https?:\/\/(([^:]+):([^@]+)@)?([^:]+):(\d+)$/);
    if (!proxyMatch) {
      console.error('[OTP Service] Invalid proxy URL format:', this.proxyUrl);
      return null;
    }

    const [, , username, password, host, port] = proxyMatch;
    
    return {
      protocol: this.proxyUrl.startsWith('https') ? 'https' : 'http',
      host: host,
      port: parseInt(port),
      auth: username && password ? {
        username: username,
        password: password
      } : undefined
    };
  }

  async sendSMS(phoneNumber, message, retryCount = 0) {
    if (this.mockMode) {
      console.log(`[OTP Service] MOCK MODE: Would send SMS to ${phoneNumber}: ${message}`);
      return {
        success: true,
        messageId: 'mock_' + Date.now()
      };
    }

    if (!this.apiKey) {
      throw new Error('Ghasedak API key not configured');
    }

    try {
      console.log(`[OTP Service] Sending SMS to ${phoneNumber} (attempt ${retryCount + 1})`);
      
      const payload = {
        receptor: phoneNumber,
        type: 1,
        template: this.templateName,
        param1: message.match(/\d{6}/)?.[0] || '123456' // Extract OTP from message
      };

      const config = {
        method: 'post',
        url: 'https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpWithParams',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        data: payload,
        timeout: this.connectTimeout * 1000
      };

      // Add proxy configuration
      const proxyConfig = this.getProxyConfig();
      if (proxyConfig) {
        config.proxy = proxyConfig;
        console.log(`[OTP Service] Using proxy: ${proxyConfig.host}:${proxyConfig.port}`);
      }

      const response = await axios(config);
      console.log('[OTP Service] Ghasedak API Response:', response.data);

      if (response.data && response.data.result && response.data.result.code === 200) {
        return {
          success: true,
          messageId: response.data.result.items?.[0]?.messageid || 'unknown'
        };
      } else {
        throw new Error(`Ghasedak API error: ${response.data?.result?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`[OTP Service] SMS send attempt ${retryCount + 1} failed:`, error.message);

      if (retryCount < this.maxRetry - 1) {
        const delay = this.pauseBase * Math.pow(2, retryCount) * 1000;
        console.log(`[OTP Service] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendSMS(phoneNumber, message, retryCount + 1);
      }

      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  async requestOTP(phoneNumber) {
    try {
      console.log(`[OTP Service] OTP request for: ${phoneNumber}`);
      
      // Normalize phone number
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      console.log(`[OTP Service] Normalized phone: ${normalizedPhone}`);

      // Generate OTP
      const otp = this.generateOTP();
      console.log(`[OTP Service] Generated OTP: ${otp}`);

      // Store OTP with expiration
      const otpData = {
        otp,
        phoneNumber: normalizedPhone,
        createdAt: Date.now(),
        expiresAt: Date.now() + (this.ttlSeconds * 1000),
        attempts: 0
      };

      this.otpStore.set(normalizedPhone, otpData);
      console.log(`[OTP Service] Stored OTP for ${normalizedPhone}, expires in ${this.ttlSeconds} seconds`);

      // Send SMS
      const message = `کد تایید شما: ${otp}\nاین کد تا ${this.ttlSeconds / 60} دقیقه معتبر است.`;
      const result = await this.sendSMS(normalizedPhone, message);

      if (result.success) {
        console.log(`[OTP Service] SMS sent successfully to ${normalizedPhone}, messageId: ${result.messageId}`);
        return {
          success: true,
          verificationId: crypto.createHash('sha256').update(normalizedPhone + Date.now()).digest('hex').substring(0, 16)
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
      console.error('[OTP Service] Request OTP error:', error);
      return {
        success: false,
        error: error.message || 'Failed to request OTP'
      };
    }
  }

  async verifyOTP(phoneNumber, otp) {
    try {
      console.log(`[OTP Service] Verifying OTP for: ${phoneNumber}`);
      
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      const otpData = this.otpStore.get(normalizedPhone);

      if (!otpData) {
        console.log(`[OTP Service] OTP not found for: ${normalizedPhone}`);
        return {
          success: false,
          error: 'OTP not found or expired'
        };
      }

      // Check expiration
      if (Date.now() > otpData.expiresAt) {
        console.log(`[OTP Service] OTP expired for: ${normalizedPhone}`);
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
        console.log(`[OTP Service] Too many attempts for: ${normalizedPhone}`);
        this.otpStore.delete(normalizedPhone);
        return {
          success: false,
          error: 'Too many attempts. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (otpData.otp === otp) {
        console.log(`[OTP Service] OTP verified successfully for: ${normalizedPhone}`);
        // Remove from store after successful verification
        this.otpStore.delete(normalizedPhone);
        return {
          success: true,
          phoneNumber: normalizedPhone
        };
      } else {
        console.log(`[OTP Service] Invalid OTP for: ${normalizedPhone}`);
        return {
          success: false,
          error: 'Invalid OTP'
        };
      }
    } catch (error) {
      console.error('[OTP Service] Verify OTP error:', error);
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
    let cleanedCount = 0;
    for (const [phone, otpData] of this.otpStore.entries()) {
      if (now > otpData.expiresAt) {
        this.otpStore.delete(phone);
        cleanedCount++;
      }
    }
    if (cleanedCount > 0) {
      console.log(`[OTP Service] Cleaned up ${cleanedCount} expired OTPs`);
    }
  }
}

module.exports = new OTPService();