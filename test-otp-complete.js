const axios = require('axios');

// Complete OTP Test Script - Tests the full OTP flow
async function testCompleteOTPFlow() {
  console.log('🧪 Testing Complete OTP Flow');
  console.log('=' .repeat(40));

  const phoneNumber = '09121958296';
  const baseURL = 'https://kiani.exchange/api/auth';

  try {
    // Step 1: Send OTP
    console.log('\n📱 Step 1: Sending OTP...');
    const sendResponse = await axios.post(`${baseURL}/send-otp`, {
      phoneNumber: phoneNumber
    }, {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Send OTP Response:', sendResponse.data);
    
    if (!sendResponse.data.success) {
      console.log('❌ Failed to send OTP');
      return;
    }

    // Step 2: Wait and then verify with test OTP
    console.log('\n⏳ Step 2: Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Try different test OTPs that might work
    const testOTPs = ['123456', '128288', '000000', '111111'];
    
    for (const testOTP of testOTPs) {
      console.log(`\n🔐 Step 3: Verifying OTP with ${testOTP}...`);
      
      try {
        const verifyResponse = await axios.post(`${baseURL}/verify-otp`, {
          phoneNumber: phoneNumber,
          otp: testOTP
        }, {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Verify OTP Response (${testOTP}):`, verifyResponse.data);
        
        if (verifyResponse.data.success) {
          console.log('🎉 OTP verification successful!');
          console.log('User info:', verifyResponse.data.user);
          return;
        }
        
      } catch (verifyError) {
        console.log(`❌ Verify failed with ${testOTP}:`, verifyError.response?.data?.error || verifyError.message);
      }
    }

    console.log('\n❌ All test OTPs failed. This might be expected in production mode.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.log('⏰ Request timed out - Server may be slow or unresponsive');
    } else if (error.message.includes('524')) {
      console.log('☁️ Cloudflare 524 timeout - Server backend is taking too long');
    } else if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Test with different timeout values
async function testWithDifferentTimeouts() {
  console.log('\n🔍 Testing with different timeout values...');
  
  const timeouts = [5000, 10000, 15000, 30000];
  
  for (const timeout of timeouts) {
    console.log(`\nTesting with ${timeout}ms timeout...`);
    
    try {
      const response = await axios.get('https://kiani.exchange/api/auth/status', {
        timeout: timeout
      });
      console.log(`✅ ${timeout}ms: Success - Server responded`);
      break;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`❌ ${timeout}ms: Timeout`);
      } else {
        console.log(`❌ ${timeout}ms: ${error.message}`);
        break;
      }
    }
  }
}

// Main execution
async function main() {
  await testWithDifferentTimeouts();
  await testCompleteOTPFlow();
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 NEXT STEPS IF OTP FAILS:');
  console.log('='.repeat(50));
  console.log('1. Enable mock mode: Set OTP_MOCK=1 in server environment');
  console.log('2. Restart server: pm2 restart kiani-exchange --update-env');
  console.log('3. In mock mode, any 6-digit number should work as OTP');
  console.log('4. Check server logs: pm2 logs kiani-exchange');
}

main();