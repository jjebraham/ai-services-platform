import axios from 'axios';

async function testProxyAPI() {
  const apiKey = 'e065bed2072abf1b45ff990251b9e103bf1979332a70c07ecb7afd9807086f1egDGE3';
  const phoneNumber = '09121958296';
  const otp = '123456';

  // Proxy configuration
  const proxyConfig = {
    host: 'p.webshare.io',
    port: 80,
    auth: {
      username: 'jjebraham-1',
      password: 'Amir1234'
    }
  };

  console.log('Testing Ghasedak API with proxy...');
  console.log('Proxy:', proxyConfig.host + ':' + proxyConfig.port);
  
  try {
    const response = await axios.post('https://api.ghasedak.me/v2/verification/send/simple', {
      receptor: phoneNumber,
      type: '1',
      template: 'ghasedak2',
      param1: otp
    }, {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      proxy: proxyConfig,
      timeout: 15000
    });

    console.log('API Response:', response.data);
    console.log('Status:', response.status);
    
    if (response.data && response.data.result) {
      console.log('SMS sent successfully via proxy!');
      console.log('Message ID:', response.data.result.messageid);
    } else {
      console.log('Unexpected response structure:', response.data);
    }
    
  } catch (error) {
    console.error('Error sending SMS via proxy:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testProxyAPI();
