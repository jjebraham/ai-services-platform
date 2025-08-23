// Test script to verify email verification flow
const axios = require('axios');

const API_BASE = 'https://kiani.exchange/api';

async function testEmailVerification() {
  console.log('Testing email verification flow...');
  
  // Test 1: Try to login with existing user (should work if email is confirmed)
  try {
    console.log('\n1. Testing login with existing user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'emailverifytest2@gmail.com',
      password: 'TestPass123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful - email appears to be confirmed');
      console.log('User ID:', loginResponse.data.user.id);
    }
  } catch (error) {
    if (error.response && error.response.data.requiresEmailVerification) {
      console.log('✅ Email verification required - working correctly!');
      console.log('Error message:', error.response.data.error);
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
  
  // Test 2: Check if we can register a new user (might hit rate limit)
  try {
    console.log('\n2. Testing registration with new user...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log('New user ID:', registerResponse.data.user.id);
      
      // Try to login immediately (should fail if email verification is working)
      try {
        const immediateLogin = await axios.post(`${API_BASE}/auth/login`, {
          email: `test${Date.now()}@example.com`,
          password: 'TestPass123'
        });
        
        if (immediateLogin.data.success) {
          console.log('❌ Login succeeded immediately - email verification not working');
        }
      } catch (loginError) {
        if (loginError.response && loginError.response.data.requiresEmailVerification) {
          console.log('✅ Email verification required for new user - working correctly!');
        } else {
          console.log('❌ Unexpected login error:', loginError.response?.data || loginError.message);
        }
      }
    }
  } catch (error) {
    if (error.response && error.response.data.error === 'email rate limit exceeded') {
      console.log('⚠️ Rate limit exceeded - cannot test new registration');
    } else {
      console.log('❌ Registration error:', error.response?.data || error.message);
    }
  }
}

testEmailVerification().catch(console.error);