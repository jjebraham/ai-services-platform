const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const tls = require('tls');
const crypto = require('crypto');

// Proxy configuration
const proxyHost = 'p.webshare.io';
const proxyPort = 80;
const proxyUsername = 'jjebraham-1';
const proxyPassword = 'Amir1234';
const proxy = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
const agent = new HttpsProxyAgent(proxy);

// Relaxed SSL settings - use with caution
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test neutral GET endpoint
async function testNeutralGet() {
  try {
    console.log('Testing neutral HTTPS GET via proxy...');
    const response = await axios.get('https://httpbin.org/ip', {
      httpsAgent: agent,
      proxy: false,
      timeout: 30000
    });
    console.log('Neutral GET Success:', response.data);
  } catch (error) {
    console.error('Neutral GET Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Setup error:', error.message);
    }
  }
}

// Test neutral POST endpoint
async function testNeutralPost() {
  try {
    console.log('Testing neutral HTTPS POST via proxy...');
    const data = { key: 'value' };
    const response = await axios.post('https://httpbin.org/post', data, {
      headers: { 'Content-Type': 'application/json' },
      httpsAgent: agent,
      proxy: false,
      timeout: 30000
    });
    console.log('Neutral POST Success:', response.data);
  } catch (error) {
    console.error('Neutral POST Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Setup error:', error.message);
    }
  }
}

// Ghasedak API details - replace 'your_ghasedak_api_key' with actual key if testing real send
const ghasedakUrl = 'https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpSMS';
const apiKey = process.env.GHASEDAK_API_KEY || 'your_ghasedak_api_key';
const testPhone = '09121958296'; // without +
const testTemplate = 'Ghasedak'; // replace with actual template name

async function testGhasedak() {
  try {
    console.log('Testing Ghasedak OTP API via proxy...');
    const data = {
      receptors: [
        {
          mobile: testPhone,
          clientReferenceId: '1'
        }
      ],
      templateName: testTemplate,
      inputs: [
        {
          param: 'Code',
          value: '1234'
        }
      ],
      udh: false,
      isVoice: false
    };
    const response = await axios.post(ghasedakUrl, data, {
      headers: {
        'ApiKey': apiKey,
        'Content-Type': 'application/json'
      },
      httpsAgent: agent,
      proxy: false,
      timeout: 30000
    });
    console.log('Ghasedak Success:', response.data);
  } catch (error) {
    console.error('Ghasedak Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Setup error:', error.message);
    }
  }
}

async function runTests() {
  await testNeutralGet();
  await testNeutralPost();
  await testGhasedak();
}

runTests();