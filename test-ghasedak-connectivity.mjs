import https from 'https';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

async function testConnectivity() {
  console.log('=== Ghasedak API Connectivity Test ===');
  
  // Test 1: Basic HTTPS connectivity
  console.log('1. Testing HTTPS connectivity to api.ghasedak.me...');
  try {
    const https = await import('https');
    const options = {
      hostname: 'api.ghasedak.me',
      port: 443,
      path: '/v2/account/info',
      method: 'GET',
      timeout: 5000
    };

    const req = https.request(options, (res) => {
      console.log(' HTTPS connection successful');
      console.log('Status:', res.statusCode);
      console.log('Headers:', res.headers);
    });

    req.on('error', (error) => {
      console.error(' HTTPS connection error:', error.message);
    });

    req.on('timeout', () => {
      console.error(' HTTPS connection timeout');
      req.destroy();
    });

    req.end();
  } catch (error) {
    console.error(' HTTPS test error:', error.message);
  }

  // Test 2: DNS resolution
  console.log('\\n2. Testing DNS resolution...');
  try {
    const dns = await import('dns').then(m => m.promises);
    const addresses = await dns.resolve4('api.ghasedak.me');
    console.log(' DNS resolved:', addresses);
  } catch (error) {
    console.error(' DNS resolution error:', error.message);
  }

  // Test 3: Basic ping
  console.log('\\n3. Testing basic network connectivity...');
  try {
    const { exec } = await import('child_process');
    exec('ping -c 1 api.ghasedak.me', (error, stdout, stderr) => {
      if (error) {
        console.error(' Ping error:', error.message);
      } else {
        console.log(' Ping successful');
        console.log(stdout);
      }
    });
  } catch (error) {
    console.error(' Ping test error:', error.message);
  }

  // Test 4: API key validation
  console.log('\\n4. Testing API key format...');
  const apiKey = process.env.GHASEDAK_API_KEY;
  if (apiKey) {
    console.log(' API key found:', apiKey.length, 'characters');
    console.log(' API key format:', apiKey.match(/^[a-f0-9]+$/i) ? 'Valid hex format' : 'Non-hex format');
  } else {
    console.error(' No API key found');
  }
}

// Test with curl
async function testWithCurl() {
  console.log('\\n=== Testing with curl ===');
  try {
    const { exec } = await import('child_process');
    const curlCmd = curl -s -o /dev/null -w  % -encodedCommand aAB0AHQAcABfAGMAbwBkAGUA  -H  apikey:  https://api.ghasedak.me/v2/account/info;
    
    exec(curlCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(' Curl error:', error.message);
      } else {
        console.log(' Curl response code:', stdout);
      }
    });
  } catch (error) {
    console.error(' Curl test error:', error.message);
  }
}

testConnectivity();
setTimeout(testWithCurl, 2000);
EOF -inputFormat xml -outputFormat text
