# 🚀 Deployment Guide

Complete guide to deploy the Subscription Manager application to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Deployment (Vercel)](#backend-deployment)
4. [Frontend Deployment (Vercel)](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment](#post-deployment)
7. [Custom Domain (Optional)](#custom-domain)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (sign up at [vercel.com](https://vercel.com))
- ✅ MongoDB Atlas account (sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas))
- ✅ Code pushed to GitHub repository
- ✅ Node.js 18+ installed locally

---

## MongoDB Atlas Setup

### 1. Create Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" or "Sign Up"
3. Sign up with Google (easiest) or email
4. Complete the registration

### 2. Create Free Cluster

1. Click "**Build a Database**"
2. Choose "**M0 FREE**" tier (512MB storage)
3. Provider: **AWS** (recommended)
4. Region: Choose closest to your users:
   - US East (N. Virginia) - `us-east-1`
   - Europe (Ireland) - `eu-west-1`
   - Asia Pacific (Singapore) - `ap-southeast-1`
5. Cluster Name: Keep default "**Cluster0**"
6. Click "**Create**"
7. Wait 2-3 minutes for provisioning

### 3. Create Database User

1. In "Security Quickstart":
   - Authentication Method: **Username and Password**
   - Username: `admin` (or your choice)
   - Click "**Autogenerate Secure Password**"
   - **⚠️ COPY AND SAVE THIS PASSWORD!**
   - User Privileges: **Read and write to any database**
2. Click "**Create User**"

### 4. Configure Network Access

1. Click "**Add IP Address**"
2. Click "**Allow Access from Anywhere**"
   - IP Address: `0.0.0.0/0` (auto-fills)
   - Description: "Vercel Serverless"
3. Click "**Add Entry**"
4. Click "**Finish and Close**"

> ⚠️ **Security Note**: For production, consider IP whitelisting specific Vercel IPs

### 5. Get Connection String

1. Click "**Go to Databases**"
2. Click "**Connect**" on your Cluster0
3. Choose "**Connect your application**"
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string
6. Modify it:

**Original:**
```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace:**
- `<password>` with your actual password
- Add database name before `?`: `/SubscriptionManager?`

**Final:**
```
mongodb+srv://admin:YourPassword123@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority
```

---

## Backend Deployment

### 1. Prepare Backend

Ensure your `backend/vercel.json` exists:

```json
{
  "version": 2,
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

### 2. Deploy to Vercel

**Via Vercel Dashboard (Easiest):**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "**Add New...**" → "**Project**"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Click "**Deploy**"

**Via Vercel CLI:**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to backend
cd backend

# Deploy
vercel

# Follow prompts, then deploy to production:
vercel --prod
```

### 3. Add Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `MONGODB_URI` | `mongodb+srv://admin:...` | Production |
| `JWT_SECRET` | Generate with crypto* | Production |
| `JWT_REFRESH_SECRET` | Generate with crypto* | Production |
| `JWT_EXPIRE` | `15m` | Production |
| `JWT_REFRESH_EXPIRE` | `7d` | Production |
| `FRONTEND_URL` | Will add after frontend deploy | Production |

***Generate JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Note Your Backend URL

After deployment, copy your backend URL:
```
https://subscription-manager-backend-xxx.vercel.app
```

**Test it:**
```bash
curl https://your-backend-url.vercel.app/health
```

Should return:
```json
{"success":true,"status":"healthy"}
```

---

## Frontend Deployment

### 1. Prepare Frontend

Ensure your `frontend/vercel.json` exists:

```json
{
  "version": 2,
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
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Deploy to Vercel

**Via Vercel Dashboard:**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "**Add New...**" → "**Project**"
3. Import same GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Click "**Deploy**"

**Via Vercel CLI:**

```bash
cd frontend
vercel
vercel --prod
```

### 3. Add Environment Variables

In Vercel Dashboard → Your Frontend Project → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-url.vercel.app/api/v1` | Production |
| `REACT_APP_ENV` | `production` | Production |

### 4. Update Backend CORS

Now that you have the frontend URL, update backend environment variables:

**In Backend Project Settings:**
- Add `FRONTEND_URL` = `https://your-frontend-url.vercel.app`
- Redeploy backend: Click "**Deployments**" → "**Redeploy**"

---

## Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://admin:password@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_64_character_secret_key_here
JWT_REFRESH_SECRET=your_64_character_refresh_secret_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# URLs
FRONTEND_URL=https://your-frontend.vercel.app

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@subscriptionmanager.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://your-backend.vercel.app/api/v1
REACT_APP_ENV=production
REACT_APP_NAME=Subscription Manager
REACT_APP_VERSION=2.0.0
```

---

## Post-Deployment

### 1. Test the Application

Visit your frontend URL and test:

- ✅ Signup with new account
- ✅ Login with credentials
- ✅ Add a subscription
- ✅ View dashboard
- ✅ Toggle dark mode
- ✅ Logout

### 2. Verify Database

1. Go to MongoDB Atlas Dashboard
2. Click "**Browse Collections**"
3. Verify collections exist:
   - `users`
   - `subscriptions`
   - `categories`

### 3. Check Logs

**Backend Logs:**
- Vercel Dashboard → Backend Project → **Logs**
- Look for errors or warnings

**Frontend Console:**
- Open browser DevTools (F12)
- Check Console tab for errors

---

## Custom Domain

### 1. Purchase Domain

Buy a domain from:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### 2. Add Domain to Vercel

**Frontend:**
1. Vercel Dashboard → Frontend Project → **Settings** → **Domains**
2. Click "**Add**"
3. Enter: `subscriptionmanager.com`
4. Click "**Add**"

**Backend (API Subdomain):**
1. Backend Project → **Settings** → **Domains**
2. Add: `api.subscriptionmanager.com`

### 3. Configure DNS

At your domain registrar, add these DNS records:

**For Frontend:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Backend:**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

### 4. Wait for SSL

- Vercel automatically provisions SSL (5-10 minutes)
- Certificate from Let's Encrypt
- Shows "**Valid**" when ready

### 5. Update Environment Variables

**Backend:**
- `FRONTEND_URL` = `https://subscriptionmanager.com`

**Frontend:**
- `REACT_APP_API_URL` = `https://api.subscriptionmanager.com/api/v1`

**Redeploy both projects after changes**

---

## Troubleshooting

### Issue: Backend not connecting to MongoDB

**Solutions:**
1. Verify MongoDB URI is correct
2. Check password doesn't contain special characters that need encoding
3. Ensure IP whitelist includes `0.0.0.0/0`
4. Check database name in connection string

### Issue: CORS errors in browser

**Solutions:**
1. Verify `FRONTEND_URL` is set in backend
2. Check CORS configuration includes your frontend URL
3. Redeploy backend after changing env vars

### Issue: Frontend can't reach API

**Solutions:**
1. Verify `REACT_APP_API_URL` is correct
2. Check backend is deployed and accessible
3. Test backend health endpoint directly
4. Rebuild frontend after env var changes

### Issue: 500 Internal Server Error

**Solutions:**
1. Check Vercel logs for backend
2. Verify all environment variables are set
3. Check MongoDB connection
4. Look for errors in backend logs

### Issue: Build failed

**Solutions:**
1. Check build logs in Vercel
2. Verify `package.json` scripts are correct
3. Test build locally: `npm run build`
4. Check for TypeScript or linting errors

---

## Continuous Deployment

### Automatic Deploys

Once connected to GitHub:
- Every push to `main` branch triggers deployment
- Pull requests create preview deployments
- Automatic rollback available

### Manual Redeploy

1. Vercel Dashboard → Project → **Deployments**
2. Find latest deployment
3. Click "**...**" → "**Redeploy**"

---

## Cost & Limits

### Vercel Free Tier

- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ 100 GB-hours compute/month
- ✅ 1M serverless function invocations
- ✅ Automatic SSL certificates
- ✅ Preview deployments

### MongoDB Atlas M0

- ✅ 512 MB storage
- ✅ Shared RAM and vCPU
- ✅ No backup/restore
- ✅ Pauses after 60 days inactivity

**Upgrade when needed:**
- Vercel Pro: $20/month
- MongoDB M2: $9/month

---

## Security Checklist

Before going live:

- [ ] Strong JWT secrets generated
- [ ] MongoDB user has strong password
- [ ] CORS configured with specific origins
- [ ] Rate limiting enabled
- [ ] Environment variables not in code
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Input validation on all forms
- [ ] Security headers configured (Helmet)
- [ ] Error messages don't expose sensitive info

---

## Monitoring

### Vercel Analytics

Enable in Dashboard:
- Real-time traffic
- Performance metrics
- Geographic distribution

### MongoDB Metrics

In Atlas Dashboard:
- Connections
- Operations per second
- Network traffic
- Storage usage

### Set Up Alerts

**Vercel:**
- Deployment failures
- High error rates

**MongoDB:**
- High connection count
- Storage threshold
- Performance degradation

---

## Support

Need help?

- 📖 [Vercel Documentation](https://vercel.com/docs)
- 📖 [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- 🐛 [Report Issues](https://github.com/Venu22003/subscription-management/issues)
- 💬 [GitHub Discussions](https://github.com/Venu22003/subscription-management/discussions)

---

**🎉 Congratulations! Your application is now live in production!**