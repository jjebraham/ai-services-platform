const axios = require('axios');

async function testCorrectGhasedakAPI() {
  const apiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY';
  const phoneNumber = '09121958296';
  const otp = '123456';

  console.log('Testing Correct Ghasedak API...');
  console.log('Phone:', phoneNumber);
  console.log('OTP:', otp);
  
  try {
    const requestBody = {
      receptors: [
        {
          mobile: phoneNumber,
          clientReferenceId: 'test-' + Date.now()
        }
      ],
      templateName: 'ghasedak2',
      param1: otp,
      isVoice: false,
      udh: false
    };

    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post('https://gateway.ghasedak.me/rest/api/v1/WebService/SendOtpWithParams', requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'ApiKey': apiKey
      },
      timeout: 15000
    });

    console.log('✅ SUCCESS! OTP sent successfully!');
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error sending OTP:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testCorrectGhasedakAPI();