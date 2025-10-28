# 🚀 Quick Installation & Setup Commands

## Initial Setup

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Setup Environment Variables

**Backend .env:**
```powershell
cd backend
copy .env.example .env
# Then edit .env with your values
```

**Frontend .env:**
```powershell
cd frontend
copy .env.example .env
# Then edit .env with your values
```

### 3. Start Development Servers

**Backend (in one terminal):**
```powershell
cd backend
npm run dev
```

**Frontend (in another terminal):**
```powershell
cd frontend
npm start
```

## Production Deployment

### Install Vercel CLI
```powershell
npm install -g vercel
vercel login
```

### Deploy Backend
```powershell
cd backend
vercel --prod
```

### Deploy Frontend
```powershell
cd frontend
vercel --prod
```

## Database Setup

### MongoDB Atlas
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string
6. Update backend .env

## Testing

### Run Tests
```powershell
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Check Code Quality
```powershell
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Useful Commands

### Generate JWT Secret
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check for Vulnerabilities
```powershell
npm audit
npm audit fix
```

### Update Dependencies
```powershell
npm update
```

### Build for Production
```powershell
# Frontend
cd frontend
npm run build
```

## Troubleshooting

### Clear Cache
```powershell
rm -rf node_modules package-lock.json
npm install
```

### Reset Database (Local)
```powershell
# In MongoDB shell
use SubscriptionManager
db.dropDatabase()
```

### View Logs
```powershell
# Backend development logs
cd backend
npm run dev

# Check Vercel logs
vercel logs
```

## Quick Links

- Frontend Local: http://localhost:3000
- Backend Local: http://localhost:5000
- API Docs Local: http://localhost:5000/api/v1
- MongoDB Atlas: https://cloud.mongodb.com
- Vercel Dashboard: https://vercel.com/dashboard

## Environment Variables Quick Reference

### Backend Required
- `MONGODB_URI` or `MONGODB_URI_PRODUCTION`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `FRONTEND_URL` or `FRONTEND_URL_PRODUCTION`

### Frontend Required
- `REACT_APP_API_URL` or `REACT_APP_API_URL_PRODUCTION`

## Support

For detailed instructions, see:
- README.md - Full documentation
- DEPLOYMENT.md - Detailed deployment guide
