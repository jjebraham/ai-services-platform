// Test script to verify frontend API connection
const https = require('https');
const http = require('http');

// Simulate the frontend API call
const API_BASE_URL = 'https://kiani.exchange/api';

function makeRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const postData = JSON.stringify(data);
    
    console.log(`Making request to: ${url}`);
    console.log(`Request data:`, data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`);
        console.log(`Response data:`, responseData);
        
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Request error:`, error.message);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testOTPFlow() {
  console.log('🧪 Testing Frontend API Connection');
  console.log('=' .repeat(50));
  
  const phoneNumber = '09121958296';
  const testOTP = '128288';
  
  try {
    // Test 1: Send OTP
    console.log('\n📤 Step 1: Testing send-otp endpoint...');
    const sendResult = await makeRequest('/auth/send-otp', { phoneNumber });
    
    if (sendResult.status === 200 && sendResult.data.success) {
      console.log('✅ Send OTP successful!');
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test 2: Verify OTP
      console.log('\n🔐 Step 2: Testing verify-otp endpoint...');
      const verifyResult = await makeRequest('/auth/verify-otp', { phoneNumber, otp: testOTP });
      
      if (verifyResult.status === 200 && verifyResult.data.success) {
        console.log('✅ Verify OTP successful!');
        console.log('\n🎉 Frontend API connection is working correctly!');
      } else {
        console.log('❌ Verify OTP failed:', verifyResult.data);
      }
    } else {
      console.log('❌ Send OTP failed:', sendResult.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 DNS resolution failed. Check if kiani.exchange is accessible.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Check if the server is running.');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timeout. Check network connectivity.');
    }
  }
}

// Run the test
if (require.main === module) {
  testOTPFlow();
}

module.exports = { testOTPFlow };