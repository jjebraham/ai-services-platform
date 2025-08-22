const https = require('https');

// Ghasedak API configuration
const API_KEY = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY';
const TEMPLATE_NAME = 'ghasedak2';
const MOBILE_NUMBER = '09121958296';
const OTP_CODE = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

// Request payload according to Ghasedak API documentation
const payload = {
  receptors: [
    {
      mobile: MOBILE_NUMBER,
      clientReferenceId: `test_${Date.now()}`
    }
  ],
  templateName: TEMPLATE_NAME,
  param1: OTP_CODE, // The OTP code parameter
  isVoice: false,
  udh: false
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'gateway.ghasedak.me',
  port: 443,
  path: '/rest/api/v1/WebService/SendOtpWithParams',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ApiKey': API_KEY,
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing Ghasedak OTP API...');
console.log('Mobile:', MOBILE_NUMBER);
console.log('Template:', TEMPLATE_NAME);
console.log('OTP Code:', OTP_CODE);
console.log('\nSending request...');

const req = https.request(options, (res) => {
  console.log('\nResponse Status:', res.statusCode);
  console.log('Response Headers:', res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.isSuccess) {
        console.log('\n✅ OTP sent successfully!');
        if (response.data && response.data.items) {
          response.data.items.forEach((item, index) => {
            console.log(`Message ${index + 1}:`);
            console.log(`  - Receptor: ${item.receptor}`);
            console.log(`  - Message ID: ${item.messageId}`);
            console.log(`  - Cost: ${item.cost}`);
            console.log(`  - Send Date: ${item.sendDate}`);
          });
        }
      } else {
        console.log('\n❌ Failed to send OTP');
        console.log('Error:', response.message);
      }
    } catch (error) {
      console.log('Raw response:', data);
      console.log('Parse error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Request failed:', error.message);
});

req.write(postData);
req.end();