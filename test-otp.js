const axios = require('axios');

const BASE_URL = 'https://kiani.exchange';

async function testOTPFlow() {
  try {
    console.log('Testing OTP flow...');
    
    // Step 1: Send OTP
    console.log('\n1. Sending OTP to phone number...');
    const sendResponse = await axios.post(`${BASE_URL}/api/auth/send-otp`, {
      phoneNumber: '09121958296'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Send OTP Response:', sendResponse.data);
    
    if (sendResponse.data.success) {
      console.log('OTP sent successfully!');
      
      // In a real test, you'd wait for the SMS or check logs for the OTP
      // For now, we'll use the OTP from logs
      const testOTP = '128288';
      
      // Step 2: Verify OTP
      console.log('\n2. Verifying OTP...');
      const verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        phoneNumber: '09121958296',
        otp: testOTP
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Verify OTP Response:', verifyResponse.data);
      
      if (verifyResponse.data.success) {
        console.log('OTP verification successful!');
      } else {
        console.log('OTP verification failed:', verifyResponse.data.error);
      }
    } else {
      console.log('Failed to send OTP:', sendResponse.data.error);
    }
    
  } catch (error) {
    console.error('Error testing OTP flow:', error.response?.data || error.message);
  }
}

// Run the test
testOTPFlow();