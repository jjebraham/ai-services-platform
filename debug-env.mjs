import dotenv from 'dotenv';
dotenv.config();

console.log('=== Environment Variables ===');
console.log('OTP_MOCK:', process.env.OTP_MOCK);
console.log('USE_PROXY:', process.env.USE_PROXY);
console.log('PROXY_FMT:', process.env.PROXY_FMT);
console.log('GHASEDAK_API_KEY:', process.env.GHASEDAK_API_KEY ? 'Set' : 'Missing');
console.log('GHASEDAK_TEMPLATE_NAME:', process.env.GHASEDAK_TEMPLATE_NAME);
