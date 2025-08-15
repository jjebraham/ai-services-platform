import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class GhasedakLiveTester {
  constructor() {
    this.apiKey = process.env.GHASEDAK_API_KEY;
    this.testPhone = '09121958296';
    this.templateName = process.env.GHASEDAK_TEMPLATE_NAME || 'ghasedak2';
  }

  async testConfiguration() {
    console.log('=== Ghasedak API Configuration Check ===');
    console.log('API Key configured:', !!this.apiKey);
    if (this.apiKey) {
      console.log('API Key length:', this.apiKey.length);
      console.log('Template name:', this.templateName);
    }
  }

  async testAccountInfo() {
    if (!this.apiKey) {
      console.log(' No API key found');
      return;
    }

    try {
      console.log(' Checking account information...');
      const response = await axios.get('https://api.ghasedak.me/v2/account/info', {
        headers: {
          'apikey': this.apiKey
        },
        timeout: 10000
      });
      
      console.log(' Account info:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.result) {
        console.log(' Credit balance:', response.data.result.credit);
        console.log(' Expire date:', response.data.result.expiredate);
      }
      
    } catch (error) {
      console.error(' Account info error:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  async testSendSimpleSMS() {
    if (!this.apiKey) {
      console.log(' No API key found');
      return;
    }

    try {
      console.log(' Testing simple SMS send...');
      const message = 'Test SMS from Kiani Exchange - API working correctly!';
      
      const response = await axios({
        method: 'post',
        url: 'https://api.ghasedak.me/v2/sms/send/simple',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          message: message,
          receptor: this.testPhone,
          linenumber: '10008566',
          senddate: '',
          checkid: crypto.randomUUID()
        }),
        timeout: 20000
      });
      
      console.log(' SMS send response:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.result && response.data.result.code === 200) {
        console.log(' SMS sent successfully!');
        console.log(' Message ID:', response.data.result.items?.[0]?.messageid);
      }
      
    } catch (error) {
      console.error(' SMS send error:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
    }
  }

  async testSendOTPMessage() {
    if (!this.apiKey) {
      console.log(' No API key found');
      return;
    }

    try {
      console.log(' Testing OTP message format...');
      const otp = '123456';
      const message = 'کد تایید شما: ' + otp + '\nاین کد تا 5 دقیقه معتبر است.';
      
      const response = await axios({
        method: 'post',
        url: 'https://api.ghasedak.me/v2/sms/send/simple',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          message: message,
          receptor: this.testPhone,
          linenumber: '10008566',
          senddate: '',
          checkid: crypto.randomUUID()
        }),
        timeout: 20000
      });
      
      console.log(' OTP message response:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error(' OTP message error:', error.message);
    }
  }

  async testTemplateSMS() {
    if (!this.apiKey) {
      console.log(' No API key found');
      return;
    }

    try {
      console.log(' Testing template SMS...');
      
      const response = await axios({
        method: 'post',
        url: 'https://api.ghasedak.me/v2/sms/send/verify',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: new URLSearchParams({
          receptor: this.testPhone,
          template: this.templateName,
          type: 'sms',
          param1: '123456'
        }),
        timeout: 20000
      });
      
      console.log(' Template SMS response:');
      console.log(JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.error(' Template SMS error:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
    }
  }
}

// Run all tests
async function runAllTests() {
  const tester = new GhasedakLiveTester();
  
  console.log(' Starting Ghasedak API Live Tests...');
  console.log('');
  
  await tester.testConfiguration();
  console.log('');
  
  await tester.testAccountInfo();
  console.log('');
  
  await tester.testSendSimpleSMS();
  console.log('');
  
  await tester.testSendOTPMessage();
  console.log('');
  
  await tester.testTemplateSMS();
  console.log('');
  
  console.log(' All tests completed!');
}

runAllTests().catch(console.error);
