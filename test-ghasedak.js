const axios = require('axios');

async function testGhasedakAPI() {
<<<<<<< HEAD
  const apiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3wCJddwRUFwY';
=======
  const apiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3';
>>>>>>> 6819f330d6ce66c0500646670624a6511e0ddcc4
  const phoneNumber = '09121958296';
  const otp = '123456';

  console.log('Testing Ghasedak API with phone:', phoneNumber);
  
  try {
<<<<<<< HEAD
    // Use form-encoded data format
    const formData = new URLSearchParams();
    formData.append('receptor', phoneNumber);
    formData.append('type', '1');
    formData.append('template', 'ghasedak2');
    formData.append('param1', otp);

    const response = await axios.post('https://api.ghasedak.me/v2/verification/send/simple', formData, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
=======
    const response = await axios.post('https://api.ghasedak.me/v2/verification/send/simple', {
      receptor: phoneNumber,
      type: '1',
      template: 'ghasedak2',
      param1: otp
    }, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
>>>>>>> 6819f330d6ce66c0500646670624a6511e0ddcc4
      },
      timeout: 10000
    });

    console.log('API Response:', response.data);
    console.log('Status:', response.status);
    
    if (response.data && response.data.result) {
      console.log('SMS sent successfully!');
      console.log('Message ID:', response.data.result.messageid);
    } else {
      console.log('Unexpected response structure:', response.data);
    }
    
  } catch (error) {
    console.error('Error sending SMS:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

<<<<<<< HEAD
testGhasedakAPI();
=======
testGhasedakAPI();
>>>>>>> 6819f330d6ce66c0500646670624a6511e0ddcc4
