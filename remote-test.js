// Remote test script to run on server
const https = require('https');

// Test configuration
const SERVER_HOST = 'localhost';
const SERVER_PORT = 3000;
const PHONE_NUMBER = '09121958296';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testOTPEndpoints() {
  try {
    console.log('Testing OTP endpoints with proper JSON formatting...\n');

    // Test 1: Send OTP
    console.log('1. Testing /api/auth/send-otp');
    const sendData = JSON.stringify({
      phoneNumber: PHONE_NUMBER
    });

    const sendOptions = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/api/auth/send-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(sendData)
      }
    };

    // Test 2: Verify OTP (using mock OTP)
    console.log('\n2. Testing /api/auth/verify-otp');
    const verifyData = JSON.stringify({
      phoneNumber: PHONE_NUMBER,
      otp: '128288' // Mock OTP from logs
    });

    const verifyOptions = {
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path: '/api/auth/verify-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(verifyData)
      }
    };

    console.log('Test script ready for server execution');
    console.log('Run this on the server with: node remote-test.js');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Create a version that works with HTTP for localhost
const http = require('http');

function makeHttpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testLocalOTPEndpoints() {
  try {
    console.log('Testing OTP endpoints on localhost:3000...\n');

    // Test 1: Send OTP
    console.log('1. Testing /api/auth/send-otp');
    const sendData = JSON.stringify({
      phoneNumber: PHONE_NUMBER
    });

    const sendOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/send-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(sendData)
      }
    };

    const sendResult = await makeHttpRequest(sendOptions, sendData);
    console.log('Send OTP Response:', sendResult.statusCode, sendResult.data);

    // Test 2: Verify OTP
    console.log('\n2. Testing /api/auth/verify-otp');
    const verifyData = JSON.stringify({
      phoneNumber: PHONE_NUMBER,
      otp: '128288'
    });

    const verifyOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/verify-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(verifyData)
      }
    };

    const verifyResult = await makeHttpRequest(verifyOptions, verifyData);
    console.log('Verify OTP Response:', verifyResult.statusCode, verifyResult.data);

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Export for use
if (require.main === module) {
  testLocalOTPEndpoints();
}