const http = require('http');

// Test data
const phoneNumber = '09121958296';
const otp = '128288';

// Test send-otp endpoint
function testSendOTP() {
  const postData = JSON.stringify({
    phoneNumber: phoneNumber
  });

  const options = {
    hostname: 'kiani.exchange',
    port: 443,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Send OTP Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Send OTP Response:', data);
      testVerifyOTP();
    });
  });

  req.on('error', (error) => {
    console.error('Send OTP Error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test verify-otp endpoint
function testVerifyOTP() {
  const postData = JSON.stringify({
    phoneNumber: phoneNumber,
    otp: otp
  });

  const options = {
    hostname: 'kiani.exchange',
    port: 443,
    path: '/api/auth/verify-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Verify OTP Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Verify OTP Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('Verify OTP Error:', error.message);
  });

  req.write(postData);
  req.end();
}

// Use HTTPS for secure connection
const https = require('https');

// Modified test functions for HTTPS
function testSendOTPSecure() {
  const postData = JSON.stringify({
    phoneNumber: phoneNumber
  });

  const options = {
    hostname: 'kiani.exchange',
    port: 443,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log('Send OTP Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Send OTP Response:', data);
      testVerifyOTPSecure();
    });
  });

  req.on('error', (error) => {
    console.error('Send OTP Error:', error.message);
  });

  req.write(postData);
  req.end();
}

function testVerifyOTPSecure() {
  const postData = JSON.stringify({
    phoneNumber: phoneNumber,
    otp: otp
  });

  const options = {
    hostname: 'kiani.exchange',
    port: 443,
    path: '/api/auth/verify-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log('Verify OTP Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Verify OTP Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('Verify OTP Error:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('Starting OTP API tests...');
testSendOTPSecure();