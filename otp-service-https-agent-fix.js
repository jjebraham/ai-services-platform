const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const tls = require('tls');
const crypto = require('crypto');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Proxy configuration - replace with your actual proxy details
const proxyHost = 'your_proxy_host';
const proxyPort = your_proxy_port; // e.g., 3128
// If your proxy requires authentication:
// const proxy = `http://${username}:${password}@${proxyHost}:${proxyPort}`;
const proxy = `http://${proxyHost}:${proxyPort}`;
const agent = new HttpsProxyAgent(proxy);

// Relaxed SSL settings - use with caution, only for debugging
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
axios.defaults.httpsAgent = new tls.TLSSocket({},
  { secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT });

// Ghasedak API configuration - replace with your actual API key
const ghasedakApiKey = 'your_ghasedak_api_key';
const ghasedakUrl = 'https://api.ghasedakapi.com/v1/sms/send';

app.post('/api/auth/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

  try {
    console.log(`Sending OTP to ${phoneNumber}`);
    const response = await axios.post(ghasedakUrl, {
      receptor: phoneNumber,
      message: `Your OTP is: ${otp}`,
      linenumber: 'your_line_number', // If required
      senddate: '', // If you want to schedule
      checkmessageids: '' // If needed
    }, {
      headers: {
        'apikey': ghasedakApiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      httpsAgent: agent,
      proxy: false,
      timeout: 30000 // Increased timeout to 30 seconds
    });

    console.log('SMS sent successfully:', response.data);
    // Here you would typically store the OTP in a database or cache with expiration
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

app.listen(port, () => {
  console.log(`OTP service listening at http://localhost:${port}`);
});