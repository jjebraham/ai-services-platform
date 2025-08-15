import axios from 'axios';
import https from 'https';
import { HttpProxyAgent } from 'http-proxy-agent';

class OTPService {
  constructor() {
    // In-memory storage for OTPs (in production, use Redis or a database)
    this.otpStorage = new Map();

    // Config
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
    this.baseURL = 'https://gateway.ghasedak.me/rest/api/v1/WebService';

    // Behavior
    this.otpTTL = parseInt(process.env.OTP_TTL_SECONDS) || 300; // seconds
    this.mockMode = process.env.OTP_MOCK === '1';

    // Proxy
    this.useProxy = process.env.USE_PROXY === '1';
    this.proxyFmt = process.env.PROXY_FMT || process.env.PROXY_URL || '';
    this.proxyPool = process.env.PROXY_POOL || '1-100';

    // Retry and timeouts
    this.maxRetry = parseInt(process.env.MAX_RETRY) || 5;
    this.pauseBase = parseFloat(process.env.PAUSE_BASE) || 1.0; // seconds
    this.connectTimeout = parseInt(process.env.CONNECT_TIMEOUT) || 20; // seconds
    this.readTimeout = parseInt(process.env.READ_TIMEOUT) || 30; // seconds (unused but kept for future)

    // Periodic cleanup of expired OTPs
    setInterval(() => this.cleanupExpiredOTPs(), 60_000);

    console.log('[OTP Service] Initialized with HTTP proxy for HTTPS fix');
    console.log('[OTP Service] Mock Mode:', this.mockMode);
    console.log('[OTP Service] Use Proxy:', this.useProxy);
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getProxyConfig() {
    if (!this.useProxy || !this.proxyFmt) {
      return null;
    }

    try {
      const [start, end] = this.proxyPool.split('-').map(Number);
      const randomIndex = Math.floor(Math.random() * (end - start + 1)) + start;
      const proxyUrl = this.proxyFmt.replace('{n}', randomIndex);
      
      console.log('[OTP Service] Using proxy:', proxyUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@'));
      return { proxyUrl };
    } catch (error) {
      console.error('[OTP Service] Proxy config error:', error.message);
      return null;
    }
  }

  // Create axios instance with HTTP proxy for HTTPS tunneling
  createAxiosInstance() {
    const config = {
      baseURL: this.baseURL,
      timeout: this.connectTimeout * 1000,
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': this.apiKey,
        'User-Agent': 'KianiExchange/1.0'
      }
    };

    const proxyInfo = this.getProxyConfig();
    if (proxyInfo) {
      try {
        // Convert HTTPS proxy URL to HTTP for tunneling
        const proxyUrl = new URL(proxyInfo.proxyUrl);
        const httpProxyUrl = `http://${proxyUrl.username}:${proxyUrl.password}@${proxyUrl.hostname}:${proxyUrl.port}`;
        
        console.log('[OTP Service] Using HTTP proxy for HTTPS tunneling');
        
        // Create HTTP proxy agent for HTTPS tunneling
        const proxyAgent = new HttpProxyAgent(httpProxyUrl);
        
        // Create HTTPS agent with relaxed SSL settings
        const httpsAgent = new https.Agent({
          rejectUnauthorized: false, // Allow self-signed certificates
          secureProtocol: 'TLSv1_2_method', // Force TLS 1.2
          ciphers: [
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-SHA256',
            'ECDHE-RSA-AES256-SHA384',
            'AES128-GCM-SHA256',
            'AES256-GCM-SHA384'
          ].join(':'),
          honorCipherOrder: true,
          maxVersion: 'TLSv1.3',
          minVersion: 'TLSv1.2'
        });

        config.httpsAgent = proxyAgent;
        
        // Set environment variable for Node.js TLS
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        
        console.log('[OTP Service] HTTP proxy agent configured for HTTPS tunneling');
        
      } catch (e) {
        console.error('[OTP Service] Failed to configure HTTP proxy:', e.message);
        console.log('[OTP Service] Falling back to direct connection');
      }
    } else {
      console.log('[OTP Service] Using direct connection (no proxy)');
    }

    return axios.create(config);
  }

  async sendOTP(phoneNumber, otp, retryCount = 0) {
    if (this.mockMode) {
      console.log(`[MOCK MODE] OTP ${otp} would be sent to ${phoneNumber}`);
      return { success: true, message: 'OTP sent successfully (mock mode)', messageId: 'mock-' + Date.now() };
    }

    if (!this.apiKey) {
      throw new Error('Ghasedak API key not configured');
    }

    try {
      console.log(`[OTP Service] Sending OTP attempt ${retryCount + 1}/${this.maxRetry}`);
      const axiosInstance = this.createAxiosInstance();

      const requestBody = {
        receptors: [
          { mobile: phoneNumber, clientReferenceId: 'kiani-' + Date.now() }
        ],
        templateName: this.templateName,
        param1: otp,
        isVoice: false,
        udh: false
      };

      console.log('[OTP Service] Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axiosInstance.post('/SendOtpWithParams', requestBody);
      
      console.log('[OTP Service] Response status:', response.status);
      console.log('[OTP Service] Response data:', JSON.stringify(response.data, null, 2));

      if (response.data && response.data.isSuccess) {
        const item = response.data.data.items[0];
        console.log('[OTP Service] ✅ OTP sent successfully');
        return {
          success: true,
          message: 'OTP sent successfully',
          messageId: item.messageId,
          cost: item.cost
        };
      }

      throw new Error(`Ghasedak API error: ${response.data?.message || 'Unknown error'}`);
    } catch (error) {
      console.error(`[OTP Service] ❌ OTP send attempt ${retryCount + 1} failed:`, error.message);
      
      // Log more details for debugging
      if (error.response) {
        console.error('[OTP Service] Response status:', error.response.status);
        console.error('[OTP Service] Response data:', JSON.stringify(error.response.data, null, 2));
      }
      if (error.code) {
        console.error('[OTP Service] Error code:', error.code);
      }

      if (retryCount < this.maxRetry - 1) {
        const delay = this.pauseBase * Math.pow(2, retryCount) * 1000;
        console.log(`[OTP Service] Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
        return this.sendOTP(phoneNumber, otp, retryCount + 1);
      }

      throw new Error(`Failed to send OTP after ${this.maxRetry} attempts: ${error.message}`);
    }
  }

  // Store OTP for later verification
  storeOTP(phoneNumber, otp) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const expiresAt = Date.now() + (this.otpTTL * 1000);
    this.otpStorage.set(normalizedPhone, { otp, expiresAt });
    console.log(`[OTP Service] Stored OTP for ${normalizedPhone}, expires in ${this.otpTTL}s`);
  }

  verifyOTP(phoneNumber, providedOTP) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const stored = this.otpStorage.get(normalizedPhone);

    if (!stored) {
      return { success: false, error: 'No OTP found for this phone number' };
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStorage.delete(normalizedPhone);
      return { success: false, error: 'OTP has expired' };
    }

    if (stored.otp !== providedOTP) {
      return { success: false, error: 'Invalid OTP' };
    }

    // OTP is valid, remove it
    this.otpStorage.delete(normalizedPhone);
    console.log(`[OTP Service] ✅ OTP verified successfully for ${normalizedPhone}`);
    return { success: true, message: 'OTP verified successfully' };
  }

  async requestOTP(phoneNumber) {
    try {
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
      
      // Check if there's already a valid OTP
      const existing = this.otpStorage.get(normalizedPhone);
      if (existing && Date.now() < existing.expiresAt) {
        const remainingTime = Math.ceil((existing.expiresAt - Date.now()) / 1000);
        return {
          success: false,
          error: `Please wait ${remainingTime} seconds before requesting a new OTP`
        };
      }

      const otp = this.generateOTP();
      console.log(`[OTP Service] Generated OTP ${otp} for ${normalizedPhone}`);
      
      const result = await this.sendOTP(normalizedPhone, otp);
      
      if (result.success) {
        this.storeOTP(normalizedPhone, otp);
        return {
          success: true,
          message: `OTP sent to ${normalizedPhone}`,
          messageId: result.messageId
        };
      } else {
        return { success: false, error: result.message || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('[OTP Service] Request OTP error:', error.message);
      return { success: false, error: 'Internal server error' };
    }
  }

  normalizePhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let normalized = phoneNumber.replace(/\D/g, '');
    
    // Handle Iranian phone numbers
    if (normalized.startsWith('98')) {
      normalized = '+' + normalized;
    } else if (normalized.startsWith('0')) {
      normalized = '+98' + normalized.substring(1);
    } else if (normalized.length === 10) {
      normalized = '+98' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    
    return normalized;
  }

  cleanupExpiredOTPs() {
    const now = Date.now();
    let cleaned = 0;
    for (const [phone, data] of this.otpStorage.entries()) {
      if (now > data.expiresAt) {
        this.otpStorage.delete(phone);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[OTP Service] Cleaned up ${cleaned} expired OTPs`);
    }
  }

  getOTPStatus(phoneNumber) {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
    const stored = this.otpStorage.get(normalizedPhone);
    
    if (!stored) {
      return { exists: false };
    }
    
    const remainingTime = Math.max(0, Math.ceil((stored.expiresAt - Date.now()) / 1000));
    return {
      exists: true,
      remainingTime,
      expired: remainingTime === 0
    };
  }
}

export default new OTPService();