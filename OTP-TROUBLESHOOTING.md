# OTP API Troubleshooting Guide

## Issue Analysis

The OTP verification issue was caused by several factors:

1. **Incorrect Endpoint URLs**: The server was using `/api/auth/send-otp` and `/api/auth/verify-otp`, not `/api/otp/start` or `/api/otp/verify`.

2. **Malformed JSON in Test Requests**: The curl commands were using incorrect JSON formatting with improper escaping.

3. **Request Format Issues**: The server expects proper JSON format with correct field names.

## Correct API Endpoints

### 1. Send OTP
- **URL**: `https://kiani.exchange/api/auth/send-otp`
- **Method**: POST
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "phoneNumber": "09121958296"
  }
  ```

### 2. Verify OTP
- **URL**: `https://kiani.exchange/api/auth/verify-otp`
- **Method**: POST
- **Content-Type**: application/json
- **Request Body**:
  ```json
  {
    "phoneNumber": "09121958296",
    "otp": "128288"
  }
  ```

## Correct Testing Commands

### Using curl (Windows):
```bash
# Send OTP
curl -X POST https://kiani.exchange/api/auth/send-otp -H "Content-Type: application/json" -d "{\"phoneNumber\":\"09121958296\"}"

# Verify OTP
curl -X POST https://kiani.exchange/api/auth/verify-otp -H "Content-Type: application/json" -d "{\"phoneNumber\":\"09121958296\",\"otp\":\"128288\"}"
```

### Using curl (Linux/Mac):
```bash
# Send OTP
curl -X POST https://kiani.exchange/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09121958296"}'

# Verify OTP
curl -X POST https://kiani.exchange/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"09121958296","otp":"128288"}'
```

### Using Node.js:
```javascript
const axios = require('axios');

// Send OTP
const sendResponse = await axios.post('https://kiani.exchange/api/auth/send-otp', {
  phoneNumber: '09121958296'
});

// Verify OTP
const verifyResponse = await axios.post('https://kiani.exchange/api/auth/verify-otp', {
  phoneNumber: '09121958296',
  otp: '128288'
});
```

## Server Configuration Status

✅ **JSON Parsing**: Server is configured with `express.json()` middleware
✅ **CORS**: Properly configured for production
✅ **Rate Limiting**: Active on `/api/` routes
✅ **OTP Storage**: Using in-memory Map with automatic cleanup
✅ **SMS Service**: Mock mode enabled (OTP: 128288)

## Common Error Messages and Solutions

### "Invalid phone number format"
- Ensure phone number matches regex: `/^(\+98|0)?9\d{9}$/`
- Use format: `09121958296` or `+989121958296`

### "OTP not found or expired"
- OTP expires after 5 minutes (300 seconds)
- Maximum 3 verification attempts per OTP
- Check server logs for the actual OTP sent

### "Please wait before requesting another OTP"
- Rate limiting: 60 seconds between OTP requests per phone number

## Testing Files Created

- `test-otp.js` - Node.js test script using axios
- `test-otp-curl.bat` - Windows batch file for curl testing
- `server-test.js` - HTTPS test script

## Monitoring

Check server logs for:
- OTP generation: Look for "[MOCK MODE] OTP"
- API responses: Monitor `/api/auth/*` endpoints
- Error details: Check PM2 logs for any exceptions

## Environment Variables

Key OTP-related environment variables:
- `OTP_MOCK=1` - Enable mock SMS mode
- `OTP_TTL_SECONDS=300` - OTP expiration time (5 minutes)
- `GHASEDAK_API_KEY` - Real SMS API key (when not in mock mode)