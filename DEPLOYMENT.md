# 📦 Deployment Guide - Detailed Step-by-Step

This guide provides comprehensive instructions for deploying the Subscription Manager application to production using Vercel and MongoDB Atlas.

## Table of Contents
1. [MongoDB Atlas Setup](#mongodb-atlas-setup)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

---

## 1. MongoDB Atlas Setup

### Creating Your Database

**Step 1: Create Account**
```
1. Visit https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google account
3. Verify your email address
4. Complete the welcome survey (optional)
```

**Step 2: Create Organization & Project**
```
1. Click "Create an Organization"
2. Name: "MySubscriptionApp" (or any name)
3. Click "Next" → "Create Organization"
4. Click "New Project"
5. Name: "subscription-manager-prod"
6. Click "Next" → "Create Project"
```

**Step 3: Build Database Cluster**
```
1. Click "Build a Database"
2. Choose "M0 FREE" (512MB storage, perfect for starting)
3. Provider: AWS (recommended)
4. Region: Choose closest to your users
   - US East (N. Virginia) - us-east-1
   - EU (Ireland) - eu-west-1
   - Asia Pacific (Singapore) - ap-southeast-1
5. Cluster Name: "Cluster0" (default is fine)
6. Click "Create"
7. Wait 3-5 minutes for cluster creation
```

**Step 4: Create Database User**
```
1. You'll see "Security Quickstart"
2. Authentication Method: Username and Password
3. Username: admin (or your choice)
4. Password: Click "Autogenerate Secure Password"
   ⚠️ IMPORTANT: Copy and save this password!
5. User Privileges: "Read and write to any database"
6. Click "Create User"
```

**Step 5: Configure Network Access**
```
1. Add IP Address section appears
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere"
4. IP Address: 0.0.0.0/0 (automatically filled)
5. Description: "Vercel Serverless Functions"
6. Click "Add Entry"

⚠️ Security Note: For production, you can restrict to specific IPs later
```

**Step 6: Get Connection String**
```
1. Click "Finish and Close"
2. Click "Go to Databases"
3. Click "Connect" button on your cluster
4. Choose "Connect your application"
5. Driver: Node.js
6. Version: 5.5 or later
7. Copy the connection string

Your string looks like:
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

8. Replace <password> with your actual password
9. Add database name before the query string:
mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority
```

**Step 7: Test Connection (Optional)**
```bash
# On your local machine
cd backend

# Update .env with your Atlas connection string
MONGODB_URI=mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority

# Start server to test connection
npm run dev

# You should see: "✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net"
```

---

## 2. Backend Deployment to Vercel

### Prerequisites
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
# Follow prompts to authenticate
```

### Step-by-Step Backend Deployment

**Step 1: Prepare Backend**
```bash
# Navigate to backend directory
cd backend

# Ensure all dependencies are installed
npm install

# Test locally first
npm run dev
# Server should start without errors
```

**Step 2: Initial Deployment**
```bash
# Run Vercel deployment
vercel

# Answer the prompts:
```

**Prompt Answers:**
```
? Set up and deploy "~/backend"? [Y/n] Y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] N
? What's your project's name? subscription-manager-backend
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

**Step 3: Set Environment Variables**

After initial deployment, set all required environment variables:

```bash
# MongoDB Connection
vercel env add MONGODB_URI_PRODUCTION
# When prompted, paste your MongoDB Atlas connection string:
# mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority
# Select: Production

# JWT Secrets (generate strong secrets)
# Generate secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add JWT_SECRET
# Paste generated secret
# Select: Production

vercel env add JWT_REFRESH_SECRET
# Paste another generated secret
# Select: Production

# JWT Expiration
vercel env add JWT_EXPIRE
# Value: 15m
# Select: Production

vercel env add JWT_REFRESH_EXPIRE
# Value: 7d
# Select: Production

# Node Environment
vercel env add NODE_ENV
# Value: production
# Select: Production

# Frontend URL (we'll update this after frontend deployment)
vercel env add FRONTEND_URL_PRODUCTION
# Value: https://subscription-manager-frontend.vercel.app (temporary)
# Select: Production

# Security Settings
vercel env add BCRYPT_ROUNDS
# Value: 12
# Select: Production

vercel env add RATE_LIMIT_WINDOW_MS
# Value: 900000
# Select: Production

vercel env add RATE_LIMIT_MAX_REQUESTS
# Value: 100
# Select: Production

# Logging
vercel env add LOG_LEVEL
# Value: info
# Select: Production
```

**Step 4: Deploy to Production**
```bash
# Deploy to production with environment variables
vercel --prod

# Wait for deployment to complete
# Note your production URL: https://your-backend-name.vercel.app
```

**Step 5: Test Backend Deployment**
```bash
# Test health endpoint
curl https://your-backend-name.vercel.app/health

# Expected response:
# {"success":true,"status":"healthy","uptime":...}

# Test API endpoint
curl https://your-backend-name.vercel.app/api/v1/categories

# Should return categories list
```

---

## 3. Frontend Deployment to Vercel

### Step-by-Step Frontend Deployment

**Step 1: Prepare Frontend**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Update .env with your backend URL
# Create/edit .env:
REACT_APP_API_URL=https://your-backend-name.vercel.app/api/v1
REACT_APP_ENV=production

# Test production build locally
npm run build

# Should build without errors
# Check build/static folder created
```

**Step 2: Initial Deployment**
```bash
# Run Vercel deployment
vercel

# Answer the prompts:
```

**Prompt Answers:**
```
? Set up and deploy "~/frontend"? [Y/n] Y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] N
? What's your project's name? subscription-manager-frontend
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

**Step 3: Set Environment Variables**
```bash
# API URL
vercel env add REACT_APP_API_URL
# Value: https://your-backend-name.vercel.app/api/v1
# Select: Production

vercel env add REACT_APP_API_URL_PRODUCTION
# Value: https://your-backend-name.vercel.app/api/v1
# Select: Production

# App Configuration
vercel env add REACT_APP_NAME
# Value: Subscription Manager
# Select: Production

vercel env add REACT_APP_VERSION
# Value: 2.0.0
# Select: Production

# Feature Flags
vercel env add REACT_APP_ENABLE_DARK_MODE
# Value: true
# Select: Production

vercel env add REACT_APP_ENABLE_PWA
# Value: true
# Select: Production

# Environment
vercel env add REACT_APP_ENV
# Value: production
# Select: Production
```

**Step 4: Deploy to Production**
```bash
# Deploy to production
vercel --prod

# Wait for deployment
# Note your production URL: https://your-frontend-name.vercel.app
```

**Step 5: Update Backend CORS**
```bash
# Go back to backend
cd ../backend

# Update FRONTEND_URL_PRODUCTION
vercel env rm FRONTEND_URL_PRODUCTION production
vercel env add FRONTEND_URL_PRODUCTION
# Value: https://your-frontend-name.vercel.app
# Select: Production

# Redeploy backend with updated CORS
vercel --prod
```

---

## 4. Post-Deployment Verification

### Step 1: Test Complete Flow

**Visit your frontend URL:**
```
https://your-frontend-name.vercel.app
```

**Test Authentication:**
```
1. Click "Sign Up"
2. Create a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: TestPass123!
3. Should redirect to dashboard
4. Check if user is logged in
```

**Test Subscriptions:**
```
1. Click "Add Subscription"
2. Fill in details:
   - Name: Netflix
   - Price: 15.99
   - Billing Cycle: Monthly
   - Next Billing Date: (select future date)
   - Category: Entertainment
3. Click "Save"
4. Subscription should appear in list
```

**Test Dark Mode:**
```
1. Click theme toggle icon in navbar
2. Theme should switch smoothly
3. Refresh page - theme should persist
```

### Step 2: Check Database

**Verify Data in MongoDB Atlas:**
```
1. Go to MongoDB Atlas dashboard
2. Click "Browse Collections"
3. You should see:
   - users collection (your test user)
   - subscriptions collection (your test subscription)
   - categories collection (pre-seeded categories)
```

### Step 3: Monitor Logs

**Backend Logs (Vercel Dashboard):**
```
1. Go to vercel.com/dashboard
2. Click on backend project
3. Click "Logs" tab
4. Monitor for errors
```

**Frontend Logs:**
```
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
```

---

## 5. Troubleshooting

### Common Issues & Solutions

#### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check MongoDB Atlas
1. Verify IP whitelist includes 0.0.0.0/0
2. Check database user has correct permissions
3. Verify connection string in Vercel env variables
4. Check if cluster is paused (free tier pauses after 60 days of inactivity)

# Test connection string locally:
cd backend
# Add connection string to .env
# Run: npm run dev
# Should connect successfully
```

#### Issue: "CORS error" in browser console

**Solution:**
```bash
# Update backend FRONTEND_URL_PRODUCTION
cd backend
vercel env add FRONTEND_URL_PRODUCTION
# Enter correct frontend URL
vercel --prod

# Verify in backend code that CORS is configured
```

#### Issue: Frontend shows "Failed to fetch"

**Solution:**
```bash
# Check frontend environment variables
cd frontend
vercel env ls

# Verify REACT_APP_API_URL is correct
# Redeploy:
vercel --prod
```

#### Issue: "Module not found" errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Redeploy
vercel --prod
```

#### Issue: Authentication not working

**Solution:**
```bash
# Check JWT secrets are set in backend
cd backend
vercel env ls

# Verify JWT_SECRET and JWT_REFRESH_SECRET exist
# Check browser localStorage for tokens
# Clear localStorage and try logging in again
```

### Performance Monitoring

**Check Response Times:**
```bash
# Test backend API speed
curl -w "@curl-format.txt" -o /dev/null -s https://your-backend-name.vercel.app/health

# Create curl-format.txt:
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

**Lighthouse Audit:**
```
1. Open your frontend URL in Chrome
2. Open DevTools (F12)
3. Go to "Lighthouse" tab
4. Click "Generate report"
5. Target scores:
   - Performance: 90+
   - Accessibility: 95+
   - Best Practices: 95+
   - SEO: 90+
```

---

## 6. Custom Domain Setup (Optional)

### Step 1: Purchase Domain
```
1. Buy domain from Namecheap, GoDaddy, or Google Domains
2. Example: subscriptionmanager.com
```

### Step 2: Add Domain to Vercel

**For Frontend:**
```
1. Go to Vercel Dashboard
2. Select frontend project
3. Go to Settings → Domains
4. Click "Add"
5. Enter: subscriptionmanager.com
6. Click "Add"
```

**For Backend:**
```
1. Select backend project
2. Go to Settings → Domains
3. Add: api.subscriptionmanager.com
```

### Step 3: Configure DNS

**Add DNS Records at your domain registrar:**

**For Frontend (subscriptionmanager.com):**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Backend (api.subscriptionmanager.com):**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

### Step 4: Wait for SSL
```
- Vercel automatically provisions SSL certificate
- Usually takes 5-10 minutes
- You'll see "Valid" status when ready
```

### Step 5: Update Environment Variables
```bash
# Update backend
cd backend
vercel env add FRONTEND_URL_PRODUCTION
# Value: https://subscriptionmanager.com
vercel --prod

# Update frontend
cd frontend
vercel env add REACT_APP_API_URL_PRODUCTION
# Value: https://api.subscriptionmanager.com/api/v1
vercel --prod
```

---

## 7. Continuous Deployment

### Auto-Deploy from GitHub

**Step 1: Connect GitHub Repository**
```
1. Push your code to GitHub
2. Go to Vercel Dashboard
3. Click "Import Project"
4. Select "Import Git Repository"
5. Authorize GitHub
6. Select your repository
7. Vercel will auto-detect settings
```

**Step 2: Configure Build Settings**

**Backend:**
```
Framework Preset: Other
Build Command: (leave empty)
Output Directory: (leave empty)
Install Command: npm install
Root Directory: backend/
```

**Frontend:**
```
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
Install Command: npm install
Root Directory: frontend/
```

**Step 3: Enable Auto-Deploy**
```
- Every push to main branch will auto-deploy
- Pull requests create preview deployments
- Rollback available with one click
```

---

## 8. Monitoring & Maintenance

### Health Checks

**Setup Monitoring:**
```
1. Use UptimeRobot (free): https://uptimerobot.com
2. Add monitors for:
   - https://your-backend-name.vercel.app/health
   - https://your-frontend-name.vercel.app
3. Get alerts via email/SMS if site goes down
```

### Backup Strategy

**MongoDB Atlas Backups:**
```
1. Go to Cluster → Backup
2. Free tier: Manual backups only
3. Paid tier: Automatic continuous backups
4. Export data regularly:
   - Go to Collections
   - Select collection
   - Click "..." → Export Collection
```

### Update Dependencies

**Monthly Maintenance:**
```bash
# Backend
cd backend
npm outdated
npm update
npm audit fix

# Frontend
cd frontend
npm outdated
npm update
npm audit fix

# Redeploy after updates
vercel --prod
```

---

## 🎉 Deployment Complete!

Your Subscription Manager is now live and accessible worldwide!

**Next Steps:**
- Share your application URL
- Monitor error logs
- Gather user feedback
- Plan feature enhancements
- Set up analytics (Google Analytics, Plausible)

**Support:**
- For issues, check the Troubleshooting section
- Review Vercel logs for errors
- Check MongoDB Atlas for database issues

---

**Need Help?** Open an issue on GitHub or contact support.
