# 🚀 Deployment Checklist

## ✅ Pre-Deployment Steps (Completed)

- [x] Email service implemented (emailService.js)
- [x] Testmail.app account created
- [x] SMTP credentials configured in local .env
- [x] Backend running locally (http://localhost:5000)
- [x] Frontend running locally (http://localhost:3000)
- [x] Git installed
- [x] .gitignore configured
- [x] Git repository initialized
- [x] Initial commit created

---

## 📋 GitHub Setup (In Progress)

- [ ] GitHub repository created
- [ ] Repository URL copied
- [ ] Remote origin added
- [ ] Code pushed to GitHub

**Commands to run after repository creation:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/subscription-manager.git
git branch -M main
git push -u origin main
```

---

## 🌐 Vercel Backend Deployment

### Backend Environment Variables Needed:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://Venuprasad_db:DWQF9ReqYwrZ1AUc@subscription-management.jxcisob.mongodb.net/SubscriptionManager?retryWrites=true&w=majority
JWT_SECRET=your_strong_jwt_secret_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_strong_refresh_secret_key_at_least_32_characters_long
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SMTP_HOST=smtp.testmail.app
SMTP_PORT=587
SMTP_USER=3fpzp
SMTP_PASSWORD=051bbb85-b943-4326-afb5-63c8c21c893f
SMTP_FROM=noreply@subscriptionmanager.com
FRONTEND_URL=https://your-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12
LOG_LEVEL=info
```

### Deployment Steps:
- [ ] Log in to Vercel (https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import GitHub repository
- [ ] Select `backend` as root directory
- [ ] Add environment variables
- [ ] Deploy backend
- [ ] Copy backend URL

---

## 🎨 Vercel Frontend Deployment

### Frontend Environment Variables Needed:

```env
REACT_APP_API_URL=https://your-backend.vercel.app/api/v1
REACT_APP_NAME=Subscription Manager
REACT_APP_VERSION=2.0.0
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_PWA=true
REACT_APP_ENV=production
```

### Deployment Steps:
- [ ] Click "Add New Project" again
- [ ] Import same GitHub repository
- [ ] Select `frontend` as root directory
- [ ] Add environment variables
- [ ] Deploy frontend
- [ ] Copy frontend URL

---

## 🔄 Update CORS & URLs

After both deployments:

### 1. Update Backend Environment Variables:
- [ ] Add `FRONTEND_URL` with actual frontend URL
- [ ] Redeploy backend

### 2. Update Frontend Environment Variables:
- [ ] Add `REACT_APP_API_URL` with actual backend URL
- [ ] Redeploy frontend

### 3. MongoDB Atlas IP Whitelist:
- [ ] Go to MongoDB Atlas → Network Access
- [ ] Click "Add IP Address"
- [ ] Select "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Confirm

---

## 🧪 Production Testing

### Backend Tests:
- [ ] Test health endpoint: `https://your-backend.vercel.app/health`
- [ ] Test API: `https://your-backend.vercel.app/api/v1`

### Frontend Tests:
- [ ] Open: `https://your-frontend.vercel.app`
- [ ] Test signup (should receive welcome email)
- [ ] Test login
- [ ] Test dashboard loading
- [ ] Test subscription creation
- [ ] Test "mark as paid" functionality
- [ ] Test settings (theme persistence)
- [ ] Test forgot password (should receive reset email)
- [ ] Test logout

### Email Tests:
- [ ] Sign up new user → Check Testmail inbox for welcome email
- [ ] Forgot password → Check Testmail inbox for reset email
- [ ] Verify email links work correctly

---

## 🔐 Security Checklist

- [ ] Generate new strong JWT secrets (don't use development secrets)
- [ ] Verify .env is in .gitignore
- [ ] Confirm no secrets in GitHub repository
- [ ] CORS configured for production domains only
- [ ] MongoDB Atlas has proper IP whitelist
- [ ] Rate limiting enabled

---

## 📝 Post-Deployment

- [ ] Custom domain setup (optional)
- [ ] Set up monitoring in Vercel dashboard
- [ ] Enable automatic deployments from GitHub
- [ ] Document production URLs
- [ ] Share app with users! 🎉

---

## 🆘 Troubleshooting

### Common Issues:

**502 Bad Gateway:**
- Check MongoDB connection string
- Verify environment variables
- Check Vercel function logs

**CORS Errors:**
- Update FRONTEND_URL in backend
- Redeploy backend
- Clear browser cache

**404 Errors:**
- Check root directory settings
- Verify vercel.json configuration

**Email Not Sending:**
- Verify SMTP credentials
- Check backend logs in Vercel
- Test Testmail.app account is active

**Database Connection Failed:**
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string
- Check database user permissions

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
- **Testmail.app:** https://testmail.app/docs
- **GitHub Docs:** https://docs.github.com

---

## ✨ Success Criteria

Your deployment is successful when:

✅ Backend health endpoint returns success  
✅ Frontend loads without errors  
✅ Users can sign up and receive welcome email  
✅ Users can log in and see dashboard  
✅ Subscriptions can be created and managed  
✅ "Mark as paid" works without duplicates  
✅ Settings save correctly  
✅ Theme persists across sessions  
✅ Password reset emails are received  
✅ No console errors in production  

---

**Current Status:** Step 7 - Creating GitHub Repository

**Next Action:** After GitHub repository is created, proceed with Step 8 (Push to GitHub)
