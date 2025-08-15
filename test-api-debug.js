const axios = require('axios');

async function debugAPIKey() {
  const apiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY';
  
  console.log('🔍 Debugging API Key...');
  console.log('API Key length:', apiKey.length);
  console.log('API Key:', apiKey);
  console.log('');
  
  // Test 1: Account Info
  console.log('Test 1: Account Info Endpoint');
  try {
    const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
      headers: {
        'apikey': apiKey
      },
      timeout: 10000
    });
    console.log('✅ Account Info Success:', response.data);
  } catch (error) {
    console.log('❌ Account Info Failed:', error.response?.data || error.message);
  }
  
  console.log('');
  
  // Test 2: Different header format
  console.log('Test 2: Different Header Format');
  try {
    const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      timeout: 10000
    });
    console.log('✅ Bearer Token Success:', response.data);
  } catch (error) {
    console.log('❌ Bearer Token Failed:', error.response?.data || error.message);
  }
  
  console.log('');
  
  // Test 3: SMS Send Test
  console.log('Test 3: SMS Send Test');
  try {
    const formData = new URLSearchParams();
    formData.append('receptor', '09121958296');
    formData.append('type', '1');
    formData.append('template', 'ghasedak2');
    formData.append('param1', '123456');

    const response = await axios.post('https://api.ghasedak.me/v2/verification/send/simple', formData, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000
    });
    console.log('✅ SMS Send Success:', response.data);
  } catch (error) {
    console.log('❌ SMS Send Failed:', error.response?.data || error.message);
  }
}

debugAPIKey();