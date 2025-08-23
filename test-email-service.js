require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./Settings');
const { sendEmail, sendVerificationEmail } = require('./email');

// Test email service configuration and functionality
async function testEmailService() {
  try {
    console.log('🔍 Testing Email Service Configuration...');
    
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Check email settings
    console.log('\n📧 Checking Email Settings...');
    const smtpHost = await Settings.getValue('smtp_host');
    const smtpPort = await Settings.getValue('smtp_port');
    const smtpUsername = await Settings.getValue('smtp_username');
    const smtpPassword = await Settings.getValue('smtp_password');
    const fromAddress = await Settings.getValue('email_from_address');
    const fromName = await Settings.getValue('email_from_name');
    
    console.log('SMTP Host:', smtpHost || 'NOT SET');
    console.log('SMTP Port:', smtpPort || 'NOT SET');
    console.log('SMTP Username:', smtpUsername || 'NOT SET');
    console.log('SMTP Password:', smtpPassword ? '***SET***' : 'NOT SET');
    console.log('From Address:', fromAddress || 'NOT SET');
    console.log('From Name:', fromName || 'NOT SET');
    
    // Check if all required settings are present
    if (!smtpHost || !smtpUsername || !smtpPassword) {
      console.log('\n❌ Email service is not properly configured!');
      console.log('Missing required settings:');
      if (!smtpHost) console.log('  - smtp_host');
      if (!smtpUsername) console.log('  - smtp_username');
      if (!smtpPassword) console.log('  - smtp_password');
      
      console.log('\n💡 To configure email service, you need to set these values in the database.');
      console.log('You can use the admin panel or directly update the settings collection.');
      return;
    }
    
    console.log('\n✅ All required email settings are configured');
    
    // Test basic email sending
    console.log('\n📤 Testing basic email sending...');
    try {
      const testEmail = {
        email: 'test@example.com',
        subject: 'Test Email from AI Services Platform',
        message: 'This is a test email to verify email service functionality.',
        html: '<p>This is a <strong>test email</strong> to verify email service functionality.</p>'
      };
      
      // Note: This will attempt to send but may fail if SMTP credentials are invalid
      // We're mainly testing the configuration and connection
      await sendEmail(testEmail);
      console.log('✅ Basic email sending test passed');
    } catch (error) {
      console.log('❌ Basic email sending test failed:', error.message);
      
      // Check common error types
      if (error.message.includes('authentication')) {
        console.log('💡 This appears to be an authentication issue. Check SMTP username/password.');
      } else if (error.message.includes('connection')) {
        console.log('💡 This appears to be a connection issue. Check SMTP host/port.');
      } else if (error.message.includes('Invalid login')) {
        console.log('💡 Invalid SMTP credentials. Please verify username and password.');
      }
    }
    
    // Test verification email template
    console.log('\n📧 Testing verification email template...');
    try {
      const testUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };
      const testToken = 'test-verification-token-123';
      
      await sendVerificationEmail(testUser, testToken);
      console.log('✅ Verification email template test passed');
    } catch (error) {
      console.log('❌ Verification email template test failed:', error.message);
    }
    
    // Check environment variables
    console.log('\n🔧 Checking Environment Variables...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('SETTINGS_ENCRYPTION_KEY:', process.env.SETTINGS_ENCRYPTION_KEY ? 'SET' : 'USING DEFAULT');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
    
    console.log('\n✅ Email service testing completed!');
    
  } catch (error) {
    console.error('❌ Email service test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB disconnected');
  }
}

// Run the test
testEmailService().catch(console.error);