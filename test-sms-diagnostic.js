const axios = require('axios');

// SMS Diagnostic Test
console.log('🔍 SMS Diagnostic Test Started...');
console.log('Testing Ghasedak API connectivity...');

const testSMS = async () => {
  try {
    // Test 1: Basic connectivity
    console.log('\n✅ Test 1: API Connectivity');
    const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
      headers: {
        'apikey': 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3'
      }
    });
    console.log('API Response:', response.data);

    // Test 2: SMS Send Test
    console.log('\n📱 Test 2: SMS Send Test');
    const smsResponse = await axios.post('https://api.ghasedak.me/v2/sms/send/simple', {
      message: 'Test SMS from Kiani Exchange - Diagnostic Test',
      receptor: '+989121958296',
      linenumber: '30000252500015'
    }, {
      headers: {
        'apikey': 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SMS Sent Successfully!');
    console.log('Response:', smsResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    console.error('Status:', error.response ? error.response.status : 'Network Error');
  }
};

testSMS();