const axios = require('axios');

const testOTP = async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/send-otp', {
      phoneNumber: '+989121958296'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testOTP();