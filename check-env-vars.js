require('dotenv').config();
console.log('OTP_MOCK:', process.env.OTP_MOCK);
console.log('GHASEDAK_API_KEY:', process.env.GHASEDAK_API_KEY ? 'SET' : 'NOT SET');
console.log('GHASEDAK_TEMPLATE_NAME:', process.env.GHASEDAK_TEMPLATE_NAME);