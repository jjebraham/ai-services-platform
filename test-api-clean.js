const axios = require('axios');

async function testCleanAPIKey() {
  // Clean the API key of any potential whitespace or formatting issues
  const rawApiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY';
  const apiKey = rawApiKey.trim();
  
  console.log('🧹 Testing with cleaned API Key...');
  console.log('Raw length:', rawApiKey.length);
  console.log('Clean length:', apiKey.length);
  console.log('API Key:', apiKey);
  console.log('');
  
  // Test with account info endpoint
  try {
    const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
      headers: {
        'apikey': apiKey
      },
      timeout: 15000
    });
    
    console.log('✅ SUCCESS! API Key is valid!');
    console.log('Account Info:', response.data);
    
    // If account info works, test SMS sending
    console.log('\n📱 Testing SMS sending...');
    const formData = new URLSearchParams();
    formData.append('receptor', '09121958296');
    formData.append('type', '1');
    formData.append('template', 'ghasedak2');
    formData.append('param1', '123456');

    const smsResponse = await axios.post('https://api.ghasedak.me/v2/verification/send/simple', formData, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });
    
    console.log('✅ SMS sent successfully!');
    console.log('SMS Response:', smsResponse.data);
    
  } catch (error) {
    console.error('❌ API Key test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    
    // Additional debugging
    console.log('\n🔍 Debug Info:');
    console.log('API Key starts with:', apiKey.substring(0, 10) + '...');
    console.log('API Key ends with:', '...' + apiKey.substring(apiKey.length - 10));
    console.log('Contains special chars:', /[^a-zA-Z0-9]/.test(apiKey));
  }
}

testCleanAPIKey();