const http = require('http');

function testSendOTP() {
  const postData = JSON.stringify({ phoneNumber: '09121958296' });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/send-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Send OTP:', res.statusCode, data);
    });
  });

  req.on('error', (error) => {
    console.error('Send OTP Error:', error.message);
  });

  req.write(postData);
  req.end();
}

function testVerifyOTP() {
  const postData = JSON.stringify({ phoneNumber: '09121958296', otp: '128288' });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/verify-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Verify OTP:', res.statusCode, data);
    });
  });

  req.on('error', (error) => {
    console.error('Verify OTP Error:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('Testing OTP endpoints...');
testSendOTP();
setTimeout(testVerifyOTP, 1000);
