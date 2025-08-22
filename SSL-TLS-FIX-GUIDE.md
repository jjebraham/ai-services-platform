# SSL/TLS Issue Fix Guide for SMS Service

## Problem Analysis
The SSL/TLS error "write EPROTO" with "wrong version number" indicates a handshake failure when connecting to the Ghasedak SMS API. This is likely caused by:

1. **Proxy Configuration Issues**: The proxy might not support HTTPS properly
2. **SSL/TLS Version Mismatch**: Server requiring newer TLS versions
3. **Certificate Issues**: Invalid or expired certificates
4. **Network Firewall**: Blocking SSL/TLS connections

## Solution Options

### Option 1: Disable Proxy (Recommended First Step)
If you're using a proxy, it might be causing the SSL issue. Update your `.env` file:

```bash
# In your .env file
USE_PROXY=0
# or remove the USE_PROXY line entirely
```

### Option 2: Update SSL/TLS Configuration
Add these environment variables to force modern SSL/TLS:

```bash
# Add to .env file
NODE_TLS_REJECT_UNAUTHORIZED=0  # Temporary fix for testing (not recommended for production)
NODE_OPTIONS="--tls-min-v1.2"
```

### Option 3: Fix Proxy SSL Support
If you must use a proxy, ensure it supports HTTPS:

```bash
# Update .env with HTTPS proxy
USE_PROXY=1
PROXY_FMT=https://username:password@proxy-server:port
# Make sure the proxy URL uses https:// not http://
```

### Option 4: Update Node.js and OpenSSL
Ensure you're using a recent version of Node.js:

```bash
# Check current version
node --version
# Should be v16+ or v18+ for better SSL support

# Update Node.js (if needed)
npm install -g n
n stable
```

### Option 5: Use Alternative HTTP Client
Modify the `otp-service.js` to use a more robust HTTP client:

```javascript
// In otp-service.js, update the sendSMS method
const config = {
  method: 'post',
  url: 'https://api.ghasedak.me/v2/sms/send/simple',
  headers: {
    'apikey': this.apiKey,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'axios/1.6.0'
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Temporary for testing
    secureProtocol: 'TLSv1_2_method'
  }),
  data: new URLSearchParams({
    message: message,
    receptor: phoneNumber,
    linenumber: '10008566',
    senddate: '',
    checkid: crypto.randomUUID()
  }),
  timeout: this.connectTimeout * 1000
};
```

### Option 6: Test Connectivity
Run these commands to test the connection:

```bash
# Test basic SSL connectivity
openssl s_client -connect api.ghasedak.me:443

# Test with curl
curl -v https://api.ghasedak.me/v2/sms/send/simple \
  -H "apikey: YOUR_API_KEY" \
  -d "message=test&receptor=YOUR_PHONE"

# Test with Node.js
curl -X POST https://api.ghasedak.me/v2/sms/send/simple \
  -H "apikey: YOUR_API_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "message=test&receptor=YOUR_PHONE"
```

## Step-by-Step Fix Implementation

### Step 1: Check Current Configuration
```bash
# On your server, check current .env
cd /home/kianirad2020/ai-services-platform
cat .env | grep -E "(USE_PROXY|OTP_MOCK|GHASEDAK)"
```

### Step 2: Disable Proxy (First Attempt)
```bash
# Edit .env file
nano .env
# Change USE_PROXY=1 to USE_PROXY=0
# Save and restart
pm2 restart kiani-exchange
```

### Step 3: Test Without Proxy
```bash
# Run the test again
node test-endpoint.js
```

### Step 4: If Still Failing, Update SSL Settings
```bash
# Add to .env
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_OPTIONS="--tls-min-v1.2"
pm2 restart kiani-exchange
```

### Step 5: Verify Fix
```bash
# Check logs for SSL errors
pm2 logs kiani-exchange --lines 50
```

## Production Considerations

**Important**: The `NODE_TLS_REJECT_UNAUTHORIZED=0` setting disables SSL certificate verification and should only be used for testing. For production:

1. **Use valid certificates**: Ensure your server's SSL certificates are valid
2. **Update CA bundle**: Make sure your server's CA certificates are up to date
3. **Use proper proxy**: If using a proxy, ensure it supports HTTPS and has valid certificates
4. **Monitor logs**: Set up proper logging for SSL/TLS errors

## Alternative SMS Providers
If Ghasedak continues to have SSL issues, consider these alternatives:

- **Kavenegar**: Similar Iranian SMS service
- **Twilio**: International SMS service with good SSL support
- **AWS SNS**: Amazon's SMS service
- **Nexmo**: Another reliable SMS provider

## Quick Fix Script
Create this script on your server:

```bash
#!/bin/bash
# ssl-fix.sh

echo "Checking SSL/TLS configuration..."
cd /home/kianirad2020/ai-services-platform

# Backup current .env
cp .env .env.backup

# Disable proxy
sed -i 's/USE_PROXY=1/USE_PROXY=0/' .env

# Add SSL settings
echo "NODE_TLS_REJECT_UNAUTHORIZED=0" >> .env
echo "NODE_OPTIONS=--tls-min-v1.2" >> .env

# Restart service
pm2 restart kiani-exchange

echo "SSL fix applied. Check logs:"
pm2 logs kiani-exchange --lines 20
```

Run it:
```bash
chmod +x ssl-fix.sh
./ssl-fix.sh
```