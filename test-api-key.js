const axios = require('axios');

async function testAPIKey() {
  const apiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY';
  
  console.log('Testing API Key validity...');
  
  try {
    const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
      headers: {
        'apikey': apiKey
      },
      timeout: 10000
    });

    console.log('✅ API Key is VALID!');
    console.log('Account Info:', response.data);
    
  } catch (error) {
    console.error('❌ API Key test failed:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testAPIKey();