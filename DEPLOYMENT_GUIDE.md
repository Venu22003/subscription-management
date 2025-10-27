# 🚀 Complete Deployment Guide - Subscription Manager

## Table of Contents
1. [Email Setup with Testmail.app](#1-email-setup-with-testmailapp)
2. [GitHub Repository Setup](#2-github-repository-setup)
3. [Vercel Deployment - Backend](#3-vercel-deployment---backend)
4. [Vercel Deployment - Frontend](#4-vercel-deployment---frontend)
5. [Environment Variables Configuration](#5-environment-variables-configuration)
6. [Testing Deployment](#6-testing-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Email Setup with Testmail.app

### Step 1.1: Create Testmail.app Account

1. Go to [https://testmail.app](https://testmail.app)
2. Click "Sign Up" (Free tier: 100 emails/day)
3. Verify your email address
4. Get your credentials from dashboard

### Step 1.2: Get SMTP Credentials

Once logged in:
1. Go to **Dashboard**
2. Navigate to **SMTP Settings**
3. Note down these credentials:
   ```
   SMTP Host: smtp.testmail.app
   SMTP Port: 587
   SMTP Username: Your testmail namespace (e.g., demo.abc123)
   SMTP Password: Your API key
   ```

### Step 1.3: Create Email Service

Create `backend/services/emailService.js`:

```javascript
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

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

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPaymentReminder,
  sendPasswordResetEmail,
};
```

### Step 1.4: Update Auth Controller

Update `backend/controllers/authController.js` to use email service:

```javascript
// Add at top of file
const { sendWelcomeEmail } = require('../services/emailService');

// In signup function, replace the TODO section:
// After user.save(), add:
if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  await sendWelcomeEmail(user.email, user.name);
}
```

### Step 1.5: Add to .env

```env
# Email Configuration (Testmail.app)
SMTP_HOST=smtp.testmail.app
SMTP_PORT=587
SMTP_USER=your-namespace.abc123
SMTP_PASSWORD=your-api-key
SMTP_FROM=Subscription Manager <noreply@subscriptionmanager.com>
```

---

## 2. GitHub Repository Setup

### Step 2.1: Initialize Git (if not already done)

```bash
cd D:\Mern-Projects\SubstrictionManagement-project
git init
```

### Step 2.2: Create .gitignore

Create `.gitignore` in root:

```gitignore
# Dependencies
node_modules/
backend/node_modules/
frontend/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
backend/.env
frontend/.env

# Production build
backend/dist
frontend/build
frontend/.next

# Logs
*.log
logs/
backend/logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
coverage/

# Misc
.cache
```

### Step 2.3: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `subscription-manager` (or your preferred name)
3. **Description**: "MERN Stack Subscription Manager - Track and manage all your subscriptions"
4. **Visibility**: Public or Private (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we have them already)
6. Click "Create repository"

### Step 2.4: Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete MERN Subscription Manager"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/subscription-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 3. Vercel Deployment - Backend

### Step 3.1: Create Vercel Configuration

Create `backend/vercel.json` (should already exist):

```json
{
  "version": 2,
  "name": "subscription-manager-backend",
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 3.2: Deploy Backend to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. **Framework Preset**: Other
6. **Root Directory**: `backend`
7. Click "Deploy"

### Step 3.3: Add Backend Environment Variables

In Vercel Dashboard → Your Backend Project → Settings → Environment Variables:

```
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://Venuprasad_db:DWQF9ReqYwrZ1AUc@subscription-management.jxcisob.mongodb.net/SubscriptionManager?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URL (will update after frontend deployment)
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Email (Testmail.app)
SMTP_HOST=smtp.testmail.app
SMTP_PORT=587
SMTP_USER=your-namespace.abc123
SMTP_PASSWORD=your-testmail-api-key
SMTP_FROM=Subscription Manager <noreply@subscriptionmanager.com>
```

**Important:** Generate new JWT secrets for production:
```bash
# In terminal
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 3.4: Get Backend URL

After deployment:
- Copy your backend URL (e.g., `https://subscription-manager-backend.vercel.app`)
- Save it for frontend configuration

---

## 4. Vercel Deployment - Frontend

### Step 4.1: Update API Configuration

Update `frontend/src/services/apiConfig.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                     (process.env.NODE_ENV === 'production' 
                       ? 'https://your-backend-url.vercel.app/api'
                       : 'http://localhost:5000/api');

// Rest of the file...
```

### Step 4.2: Create Vercel Configuration

Create `frontend/vercel.json`:

```json
{
  "version": 2,
  "name": "subscription-manager-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/favicon.ico",
      "dest": "/favicon.ico"
    },
    {
      "src": "/manifest.json",
      "dest": "/manifest.json"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Step 4.3: Update package.json

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "vercel-build": "react-scripts build"
  }
}
```

### Step 4.4: Deploy Frontend to Vercel

1. In Vercel Dashboard, click "Add New..." → "Project"
2. Select same GitHub repository
3. **Framework Preset**: Create React App
4. **Root Directory**: `frontend`
5. Click "Deploy"

### Step 4.5: Add Frontend Environment Variables

In Vercel Dashboard → Your Frontend Project → Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend-url.vercel.app/api
NODE_ENV=production
```

---

## 5. Environment Variables Configuration

### Step 5.1: Update Backend CORS

After frontend deployment, update backend environment variables:

```
FRONTEND_URL=https://your-frontend-url.vercel.app
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Step 5.2: Redeploy Both

1. Backend: Trigger redeploy in Vercel (Settings → Deployments → Redeploy)
2. Frontend: Trigger redeploy in Vercel

---

## 6. Testing Deployment

### Step 6.1: Test Backend

```bash
curl https://your-backend-url.vercel.app/health
# Should return: {"status":"success","message":"Server is running"}
```

### Step 6.2: Test Frontend

1. Visit `https://your-frontend-url.vercel.app`
2. Try to signup
3. Check testmail.app inbox for welcome email
4. Login and test features

### Step 6.3: Test Email

1. Signup with email: `test@your-namespace.testmail.app`
2. Go to [https://testmail.app/inbox](https://testmail.app/inbox)
3. Check for welcome email

---

## 7. Troubleshooting

### Issue: CORS Errors

**Solution:**
```javascript
// backend/index.js
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://your-frontend-url.vercel.app',
    'http://localhost:3000', // for local testing
  ],
  credentials: true,
};
app.use(cors(corsOptions));
```

### Issue: MongoDB Connection Fails

**Solution:**
1. Check MongoDB Atlas Network Access
2. Add `0.0.0.0/0` to IP Whitelist
3. Verify connection string in Vercel env vars

### Issue: 404 on Frontend Routes

**Solution:**
Already handled in `vercel.json` with catch-all route.

### Issue: Build Fails

**Solution:**
```bash
# Test build locally
cd frontend
npm run build

cd ../backend
npm install
```

### Issue: Emails Not Sending

**Solution:**
1. Verify SMTP credentials in Vercel
2. Check testmail.app quota (100/day on free tier)
3. Check backend logs in Vercel

---

## 8. Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] MongoDB Atlas IP whitelist configured
- [ ] All environment variables set
- [ ] CORS properly configured
- [ ] Email sending working (test signup)
- [ ] Can login and use all features
- [ ] Dark mode persists
- [ ] Mark as paid working
- [ ] PDF export working
- [ ] Settings save working

---

## 9. Custom Domain (Optional)

### Add Custom Domain to Vercel

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `subscriptionmanager.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)
5. Update environment variables with new domain

---

## 10. Monitoring & Maintenance

### Enable Analytics

1. Vercel → Project → Analytics
2. View traffic, performance, errors

### Set Up Alerts

1. Vercel → Project → Settings → Git
2. Enable deployment notifications

### MongoDB Atlas Alerts

1. MongoDB Atlas → Alerts
2. Set up email alerts for:
   - High connection count
   - Storage usage
   - Performance issues

---

## 📝 Quick Reference URLs

After deployment, save these URLs:

```
Frontend: https://your-app.vercel.app
Backend API: https://your-backend.vercel.app/api
Backend Health: https://your-backend.vercel.app/health
Testmail Inbox: https://testmail.app/inbox
GitHub Repo: https://github.com/YOUR_USERNAME/subscription-manager
Vercel Dashboard: https://vercel.com/dashboard
MongoDB Atlas: https://cloud.mongodb.com
```

---

## 🎉 Congratulations!

Your Subscription Manager is now:
- ✅ Deployed on Vercel
- ✅ Connected to MongoDB Atlas
- ✅ Sending emails via Testmail.app
- ✅ Available worldwide
- ✅ Auto-scaling
- ✅ HTTPS secured
- ✅ Production-ready!

Share your project: `https://your-app.vercel.app` 🚀
