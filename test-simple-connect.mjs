import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

console.log('=== Ghasedak API Connectivity Test ===');
console.log('API Key exists:', !!process.env.GHASEDAK_API_KEY);

// Test basic connectivity
const options = {
  hostname: 'api.ghasedak.me',
  port: 443,
  path: '/v2/account/info',
  method: 'GET',
  timeout: 10000,
  headers: {
    'apikey': process.env.GHASEDAK_API_KEY || 'test'
  }
};

console.log('Testing connection to api.ghasedak.me...');
const req = https.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Connection error:', error.message);
});

req.on('timeout', () => {
  console.error('Connection timeout');
  req.destroy();
});

req.end();
