const axios = require('axios');
const fs = require('fs');

// OTP Timeout Fix Script
// This script addresses the Cloudflare 524 timeout issue causing OTP failures

console.log('🔍 OTP Timeout Diagnosis and Fix');
console.log('=' .repeat(50));

async function diagnoseOTPTimeout() {
  const results = {
    serverHealth: null,
    otpEndpoints: null,
    recommendations: []
  };

  // 1. Test server basic health
  console.log('\n1. Testing server health...');
  try {
    const healthResponse = await axios.get('https://kiani.exchange/api/auth/status', {
      timeout: 10000 // 10 second timeout
    });
    
    results.serverHealth = {
      status: 'OK',
      response: healthResponse.status,
      data: healthResponse.data
    };
    console.log('✅ Server is responding');
  } catch (error) {
    results.serverHealth = {
      status: 'ERROR',
      error: error.message,
      code: error.code
    };
    
    if (error.message.includes('524')) {
      console.log('❌ Cloudflare 524 timeout detected');
      results.recommendations.push('Enable OTP mock mode to bypass SMS API delays');
      results.recommendations.push('Check server process stability (frequent restarts detected)');
    } else {
      console.log('❌ Server health check failed:', error.message);
    }
  }

  // 2. Test OTP endpoints with short timeout
  console.log('\n2. Testing OTP endpoints...');
  try {
    const sendOtpResponse = await axios.post('https://kiani.exchange/api/auth/send-otp', {
      phoneNumber: '09121958296'
    }, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    results.otpEndpoints = {
      sendOtp: 'SUCCESS',
      response: sendOtpResponse.data
    };
    console.log('✅ OTP send endpoint working');
  } catch (error) {
    results.otpEndpoints = {
      sendOtp: 'ERROR',
      error: error.message
    };
    
    if (error.message.includes('524') || error.message.includes('timeout')) {
      console.log('❌ OTP endpoint timeout - Server taking too long to respond');
      results.recommendations.push('Server timeout issue confirmed');
      results.recommendations.push('Immediate fix: Enable mock mode with OTP_MOCK=1');
    }
  }

  return results;
}

async function generateFixScript() {
  console.log('\n3. Generating fix script...');
  
  const fixScript = `#!/bin/bash
# OTP Timeout Fix Script
# Run this on your server to fix the timeout issue

echo "🔧 Applying OTP timeout fixes..."

# 1. Enable mock mode temporarily to bypass SMS API delays
export OTP_MOCK=1
echo "✓ Enabled OTP mock mode"

# 2. Increase timeout values
export CONNECT_TIMEOUT=10
export READ_TIMEOUT=20
echo "✓ Increased timeout values"

# 3. Restart PM2 process with new environment
pm2 restart kiani-exchange --update-env
echo "✓ Restarted server with new settings"

# 4. Show status
pm2 show kiani-exchange

echo "🎉 Fix applied! OTP should now work in mock mode."
echo "To test: curl -X POST https://kiani.exchange/api/auth/send-otp -H 'Content-Type: application/json' -d '{\"phoneNumber\":\"09121958296\"}'"
`;

  fs.writeFileSync('otp-fix.sh', fixScript);
  console.log('✅ Fix script created: otp-fix.sh');
}

async function createMockTestScript() {
  const mockTestScript = `const axios = require('axios');

// Test OTP with mock mode enabled
async function testMockOTP() {
  console.log('🧪 Testing OTP in mock mode...');
  
  try {
    // 1. Send OTP
    const sendResponse = await axios.post('https://kiani.exchange/api/auth/send-otp', {
      phoneNumber: '09121958296'
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Send OTP Response:', sendResponse.data);
    
    // 2. In mock mode, use test OTP: 123456
    const verifyResponse = await axios.post('https://kiani.exchange/api/auth/verify-otp', {
      phoneNumber: '09121958296',
      otp: '123456' // Default mock OTP
    }, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Verify OTP Response:', verifyResponse.data);
    console.log('🎉 Mock OTP test successful!');
    
  } catch (error) {
    console.error('❌ Mock OTP test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMockOTP();
`;

  fs.writeFileSync('test-mock-otp.js', mockTestScript);
  console.log('✅ Mock test script created: test-mock-otp.js');
}

// Main execution
async function main() {
  try {
    const diagnosis = await diagnoseOTPTimeout();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\nServer Health:', diagnosis.serverHealth?.status || 'UNKNOWN');
    console.log('OTP Endpoints:', diagnosis.otpEndpoints?.sendOtp || 'UNKNOWN');
    
    if (diagnosis.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDED FIXES:');
      diagnosis.recommendations.forEach((rec, i) => {
        console.log(\`\${i + 1}. \${rec}\`);
      });
    }
    
    await generateFixScript();
    await createMockTestScript();
    
    console.log('\n' + '='.repeat(50));
    console.log('📋 IMMEDIATE ACTION STEPS');
    console.log('='.repeat(50));
    console.log('1. Upload otp-fix.sh to your server');
    console.log('2. Run: chmod +x otp-fix.sh && ./otp-fix.sh');
    console.log('3. Test with: node test-mock-otp.js');
    console.log('4. Once working, gradually disable mock mode');
    
    console.log('\n💡 ROOT CAUSE: Server timeout due to:');
    console.log('   - Frequent PM2 restarts (35 restarts observed)');
    console.log('   - Long SMS API response times');
    console.log('   - Cloudflare 524 timeout threshold exceeded');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

main();