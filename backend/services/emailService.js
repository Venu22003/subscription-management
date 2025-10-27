const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Email Service using Nodemailer
 * Supports Testmail.app and other SMTP providers
 */

// Create transporter
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    logger.warn('Email service not configured - SMTP credentials missing');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    logger.warn('Email not sent - Email service not configured');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `Subscription Manager <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Error sending email', {
      error: error.message,
      to: options.to,
      subject: options.subject,
    });
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  return await sendEmail({
    to: email,
    subject: 'Welcome to Subscription Manager! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Subscription Manager! 💳</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}! 👋</h2>
            <p>Thank you for joining Subscription Manager - your one-stop solution for managing all your subscriptions.</p>
            
            <h3>What you can do:</h3>
            <ul>
              <li>📊 Track all your subscriptions in one place</li>
              <li>💰 Monitor your monthly and yearly spending</li>
              <li>📅 Get reminders before payment dates</li>
              <li>📈 Visualize your subscription analytics</li>
              <li>🔔 Receive payment notifications</li>
            </ul>
            
            <p>Get started by adding your first subscription!</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            
            <p style="margin-top: 30px; color: #666; font-size: 12px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to Subscription Manager, ${name}! Start managing your subscriptions at ${process.env.FRONTEND_URL}/dashboard`,
  });
};

// Send payment reminder
const sendPaymentReminder = async (email, subscription) => {
  const daysUntil = Math.ceil((new Date(subscription.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return await sendEmail({
    to: email,
    subject: `Payment Reminder: ${subscription.name} - ${daysUntil} days`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Payment Reminder</h1>
          </div>
          <div class="content">
            <div class="alert">
              <strong>Upcoming Payment</strong><br>
              Your payment for <strong>${subscription.name}</strong> is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.
            </div>
            
            <h3>Subscription Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${subscription.name}</li>
              <li><strong>Amount:</strong> ₹${subscription.price}</li>
              <li><strong>Next Payment:</strong> ${new Date(subscription.nextBillingDate).toLocaleDateString()}</li>
              <li><strong>Billing Cycle:</strong> ${subscription.billingCycle}</li>
            </ul>
            
            <p>Make sure you have sufficient funds in your account!</p>
            
            <a href="${process.env.FRONTEND_URL}/subscriptions" class="button">View Subscriptions</a>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment Reminder: Your ${subscription.name} subscription (₹${subscription.price}) is due in ${daysUntil} days on ${new Date(subscription.nextBillingDate).toLocaleDateString()}`,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  return await sendEmail({
    to: email,
    subject: 'Password Reset Request 🔐',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #e74c3c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .warning { background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request 🔐</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <p style="margin-top: 20px;">Or copy this link: <br><code>${resetUrl}</code></p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This link will expire in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password reset requested. Visit: ${resetUrl} (expires in 1 hour). If you didn't request this, ignore this email.`,
  });
};

// Send monthly report
const sendMonthlyReport = async (email, name, stats) => {
  return await sendEmail({
    to: email,
    subject: `Your Monthly Subscription Report 📊`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Your Monthly Report</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Here's your subscription summary for this month:</p>
            
            <div class="stat-box">
              <strong>Total Active Subscriptions:</strong> ${stats.totalSubscriptions}
            </div>
            <div class="stat-box">
              <strong>Monthly Spending:</strong> ₹${stats.totalMonthly}
            </div>
            <div class="stat-box">
              <strong>Yearly Projection:</strong> ₹${stats.totalYearly}
            </div>
            <div class="stat-box">
              <strong>Upcoming Payments:</strong> ${stats.upcomingCount} in next 7 days
            </div>
            
            <p>Keep track of your subscriptions to avoid unexpected charges!</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your Monthly Report: ${stats.totalSubscriptions} subscriptions, ₹${stats.totalMonthly}/month, ₹${stats.totalYearly}/year. ${stats.upcomingCount} payments due in 7 days.`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPaymentReminder,
  sendPasswordResetEmail,
  sendMonthlyReport,
};
