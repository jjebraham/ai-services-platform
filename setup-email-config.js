require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./Settings');

// Setup email configuration
async function setupEmailConfig() {
  try {
    console.log('🔧 Setting up Email Configuration...');
    
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Initialize default settings first
    console.log('\n🔄 Initializing default settings...');
    await Settings.initializeDefaults();
    console.log('✅ Default settings initialized');
    
    // Check current email settings
    console.log('\n📧 Current Email Settings:');
    const currentSettings = {
      smtp_host: await Settings.getValue('smtp_host'),
      smtp_port: await Settings.getValue('smtp_port'),
      smtp_username: await Settings.getValue('smtp_username'),
      smtp_password: await Settings.getValue('smtp_password'),
      email_from_address: await Settings.getValue('email_from_address'),
      email_from_name: await Settings.getValue('email_from_name')
    };
    
    Object.entries(currentSettings).forEach(([key, value]) => {
      if (key === 'smtp_password') {
        console.log(`${key}: ${value ? '***SET***' : 'NOT SET'}`);
      } else {
        console.log(`${key}: ${value || 'NOT SET'}`);
      }
    });
    
    // Suggested SMTP configurations for common providers
    console.log('\n💡 Common SMTP Configurations:');
    console.log('\n📧 Gmail:');
    console.log('  SMTP Host: smtp.gmail.com');
    console.log('  SMTP Port: 587');
    console.log('  Username: your-email@gmail.com');
    console.log('  Password: your-app-password (not regular password)');
    console.log('  Note: Enable 2FA and use App Password');
    
    console.log('\n📧 Outlook/Hotmail:');
    console.log('  SMTP Host: smtp-mail.outlook.com');
    console.log('  SMTP Port: 587');
    console.log('  Username: your-email@outlook.com');
    console.log('  Password: your-password');
    
    console.log('\n📧 Yahoo:');
    console.log('  SMTP Host: smtp.mail.yahoo.com');
    console.log('  SMTP Port: 587');
    console.log('  Username: your-email@yahoo.com');
    console.log('  Password: your-app-password');
    
    console.log('\n📧 Custom SMTP (e.g., cPanel, hosting provider):');
    console.log('  SMTP Host: mail.yourdomain.com');
    console.log('  SMTP Port: 587 or 465');
    console.log('  Username: your-email@yourdomain.com');
    console.log('  Password: your-email-password');
    
    // Example configuration setup (commented out for safety)
    console.log('\n🔧 To configure email settings, you can use the following commands:');
    console.log('\n// Example for Gmail configuration:');
    console.log('// await Settings.setValue("smtp_host", "smtp.gmail.com", "string", "email");');
    console.log('// await Settings.setValue("smtp_port", 587, "number", "email");');
    console.log('// await Settings.setValue("smtp_username", "your-email@gmail.com", "string", "email");');
    console.log('// await Settings.setValue("smtp_password", "your-app-password", "encrypted", "email");');
    console.log('// await Settings.setValue("email_from_address", "noreply@yourdomain.com", "string", "email");');
    console.log('// await Settings.setValue("email_from_name", "AI Services Platform", "string", "email");');
    
    // Check if we should set up a basic configuration
    const shouldSetupBasic = process.argv.includes('--setup-basic');
    if (shouldSetupBasic) {
      console.log('\n🔧 Setting up basic email configuration...');
      
      // Set basic configuration (you'll need to update these values)
      await Settings.setValue('smtp_host', 'smtp.gmail.com', 'string', 'email');
      await Settings.setValue('smtp_port', 587, 'number', 'email');
      await Settings.setValue('smtp_username', 'your-email@gmail.com', 'string', 'email');
      await Settings.setValue('smtp_password', 'your-app-password', 'encrypted', 'email');
      await Settings.setValue('email_from_address', 'noreply@kiani.exchange', 'string', 'email');
      await Settings.setValue('email_from_name', 'Kiani Exchange', 'string', 'email');
      
      console.log('✅ Basic email configuration set up');
      console.log('⚠️  Please update the SMTP credentials with your actual values!');
    }
    
    // List all email-related settings
    console.log('\n📋 All Email Settings in Database:');
    const emailSettings = await Settings.find({ category: 'email' });
    emailSettings.forEach(setting => {
      const value = setting.type === 'encrypted' ? '***ENCRYPTED***' : setting.value;
      console.log(`  ${setting.key}: ${value} (${setting.type})`);
    });
    
    console.log('\n✅ Email configuration setup completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Update SMTP settings with your actual email provider credentials');
    console.log('2. Run "node test-email-service.js" to test the configuration');
    console.log('3. Use the admin panel to manage email settings through the UI');
    
  } catch (error) {
    console.error('❌ Email configuration setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 MongoDB disconnected');
  }
}

// Run the setup
setupEmailConfig().catch(console.error);