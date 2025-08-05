const nodemailer = require('nodemailer');
const Settings = require('./Settings');

// Create transporter
const createTransporter = async () => {
  const smtpHost = await Settings.getValue('smtp_host');
  const smtpPort = await Settings.getValue('smtp_port', 587);
  const smtpUsername = await Settings.getValue('smtp_username');
  const smtpPassword = await Settings.getValue('smtp_password');

  if (!smtpHost || !smtpUsername || !smtpPassword) {
    throw new Error('SMTP configuration not found');
  }

  return nodemailer.createTransporter({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUsername,
      pass: smtpPassword
    }
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = await createTransporter();
    
    const fromAddress = await Settings.getValue('email_from_address', 'noreply@aiservices.com');
    const fromName = await Settings.getValue('email_from_name', 'AI Services Platform');

    const message = {
      from: `${fromName} <${fromAddress}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

  const message = `
    Welcome to AI Services Platform!
    
    Please verify your email address by clicking the link below:
    ${verifyUrl}
    
    This link will expire in 24 hours.
    
    If you did not create an account, please ignore this email.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to AI Services Platform!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
      <p style="color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email Address - AI Services Platform',
      message,
      html
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  const message = `
    You are receiving this email because you (or someone else) has requested the reset of a password.
    
    Please click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 10 minutes.
    
    If you did not request this, please ignore this email and your password will remain unchanged.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 14px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request - AI Services Platform',
      message,
      html
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

// Send KYC status update email
const sendKYCStatusEmail = async (user, status, rejectionReason = null) => {
  let subject, message, html;

  if (status === 'approved') {
    subject = 'KYC Verification Approved - AI Services Platform';
    message = `
      Congratulations! Your KYC verification has been approved.
      
      You can now access all features of our platform and place orders for AI services.
      
      Thank you for choosing AI Services Platform!
    `;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">KYC Verification Approved!</h2>
        <p>Congratulations! Your KYC verification has been approved.</p>
        <p>You can now access all features of our platform and place orders for AI services.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <p>Thank you for choosing AI Services Platform!</p>
      </div>
    `;
  } else if (status === 'rejected') {
    subject = 'KYC Verification Rejected - AI Services Platform';
    message = `
      Unfortunately, your KYC verification has been rejected.
      
      Reason: ${rejectionReason || 'Please contact support for more information.'}
      
      You can resubmit your KYC documents after addressing the issues mentioned above.
      
      If you have any questions, please contact our support team.
    `;
    html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">KYC Verification Rejected</h2>
        <p>Unfortunately, your KYC verification has been rejected.</p>
        ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
        <p>You can resubmit your KYC documents after addressing the issues mentioned above.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/kyc" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Resubmit KYC
          </a>
        </div>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `;
  }

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
      html
    });
  } catch (error) {
    console.error('Failed to send KYC status email:', error);
    throw error;
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Order Confirmation #${order.orderNumber} - AI Services Platform`;
  
  const message = `
    Thank you for your order!
    
    Order Number: ${order.orderNumber}
    Total Amount: ${order.formattedTotalToman}
    Status: ${order.status}
    
    You will receive another email once your order is processed.
    
    Thank you for choosing AI Services Platform!
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
        <p><strong>Total Amount:</strong> ${order.formattedTotalToman}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>
      <p>You will receive another email once your order is processed.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${order._id}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Order
        </a>
      </div>
      <p>Thank you for choosing AI Services Platform!</p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
      html
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendKYCStatusEmail,
  sendOrderConfirmationEmail
};

