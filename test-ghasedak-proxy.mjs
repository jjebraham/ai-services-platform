import https from 'https';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== Ghasedak API Test with Proxy ===');

// Check environment variables
console.log('API Key exists:', !!process.env.GHASEDAK_API_KEY);
console.log('Proxy enabled:', process.env.USE_PROXY === '1');
console.log('Proxy format:', process.env.PROXY_FMT);
console.log('Proxy pool:', process.env.PROXY_POOL);

// Test proxy connectivity and Ghasedak API
async function testGhasedakWithProxy() {
  try {
    // Test 1: Check account info via proxy
    console.log('\n1. Testing account info via proxy...');
    
    const proxyUrl = process.env.PROXY_FMT?.replace('{n}', '1') || '';
    console.log('Using proxy:', proxyUrl);
    
    const config = {
      method: 'GET',
      url: 'https://api.ghasedak.me/v2/account/info',
      headers: {
        'apikey': process.env.GHASEDAK_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      proxy: false
    };

    // Add proxy configuration if enabled
    if (process.env.USE_PROXY === '1') {
      const proxyMatch = proxyUrl.match(/http:\/\/(.*?):(.*?)@(.*?):(\d+)/);
      if (proxyMatch) {
        config.proxy = {
          host: proxyMatch[3],
          port: parseInt(proxyMatch[4]),
          auth: {
            username: proxyMatch[1],
            password: proxyMatch[2]
          }
        };
      }
    }

    const response = await axios(config);
    console.log('Account info response:', response.data);

    // Test 2: Test SMS sending
    console.log('\n2. Testing SMS sending via proxy...');
    const smsConfig = {
      method: 'POST',
      url: 'https://api.ghasedak.me/v2/sms/send/simple',
      headers: {
        'apikey': process.env.GHASEDAK_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: new URLSearchParams({
        message: 'Test SMS from proxy configuration',
        receptor: '09121958296',
        linenumber: '10008566'
      }),
      timeout: 30000,
      proxy: config.proxy
    };

    const smsResponse = await axios(smsConfig);
    console.log('SMS send response:', smsResponse.data);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Test basic connectivity without proxy first
async function testBasicConnectivity() {
  console.log('\n=== Testing basic connectivity (no proxy) ===');
  try {
    const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
      headers: { 'apikey': process.env.GHASEDAK_API_KEY },
      timeout: 10000
    });
    console.log('Basic connectivity OK:', response.data.result.code);
  } catch (error) {
    console.error('Basic connectivity failed:', error.message);
  }
}

// Run tests
async function runTests() {
  await testBasicConnectivity();
  await testGhasedakWithProxy();
}

runTests();
