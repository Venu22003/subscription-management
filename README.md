# 🚀 Subscription Manager - Production Ready

A modern, full-stack subscription management application built with the MERN stack (MongoDB, Express, React, Node.js). Track all your subscriptions in one place with beautiful UI, dark mode, payment reminders, and advanced analytics.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-6.0-green.svg)

## 🌐 Live Demo

**Frontend:** [https://subscription-management-frontend-me.vercel.app](https://subscription-management-frontend-me.vercel.app)

**Backend API:** [https://subscription-management-app-mern.vercel.app](https://subscription-management-app-mern.vercel.app)

> **Note:** The app is fully deployed and running on Vercel's free tier with MongoDB Atlas.

## ✨ Features

### 🎨 Frontend
- **Modern UI**: Material-UI with glassmorphism design and smooth animations
- **Dark Mode**: Toggle between light and dark themes with local storage persistence
- **Real-time Validation**: Form validation with React Hook Form + Yup schemas
- **Responsive Design**: Mobile-first approach, works on all devices
- **Payment Calendar**: Visual calendar showing all upcoming payments
- **Advanced Analytics**: Interactive charts showing spending patterns by category
- **Search & Filter**: Powerful search with filtering by category and status

### 🔒 Backend Security
- **JWT Authentication**: Dual token system (access + refresh tokens) with automatic rotation
- **Rate Limiting**: Protection against brute force attacks (100 requests per 15 minutes)
- **Input Validation**: Comprehensive validation with Joi schemas
- **Data Sanitization**: XSS and NoSQL injection prevention with express-mongo-sanitize
- **Security Headers**: Helmet.js configuration for production-grade security
- **Password Hashing**: Bcrypt with 12 rounds for secure password storage
- **Email Service**: Welcome emails and payment reminders via Testmail.app
- **CORS Protection**: Configurable CORS with whitelist for allowed origins

### 🚀 Performance & DevOps
- **Serverless Deployment**: Deployed on Vercel for automatic scaling
- **Database Optimization**: MongoDB Atlas with connection pooling and indexes
- **Error Handling**: Centralized error handling with Winston logging
- **Email Notifications**: Automated welcome emails on signup
- **API Documentation**: RESTful API with comprehensive endpoint documentation
- **Environment Management**: Separate configurations for development and production

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Material-UI 5** - Component library
- **Framer Motion** - Animations
- **React Query** - Data fetching & caching
- **React Hook Form** - Form management
- **Yup** - Schema validation
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Date-fns** - Date manipulation

### Backend
- **Node.js 18+** - Runtime environment
- **Express 4** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Compression** - Response compression

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local or Atlas)
- **Git**
- **Vercel CLI** (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Venu22003/subscription-management.git
cd subscription-management
```

### 2. Backend Setup

\`\`\`bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/SubscriptionManager
# JWT_SECRET=your_secret_key
# etc.

# Start development server
npm run dev
\`\`\`

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

\`\`\`bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env
# REACT_APP_API_URL=http://localhost:5000/api/v1

# Start development server
npm start
\`\`\`

Frontend will run on `http://localhost:3000`

## 🌐 MongoDB Atlas Setup

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose **FREE** tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create Cluster"

### Step 3: Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set user privileges to "Read and write to any database"

### Step 4: Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - **For Vercel deployment**, this is required
   - For production, consider IP whitelisting

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `myFirstDatabase` with your database name (e.g., `SubscriptionManager`)

Example connection string:
\`\`\`
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority
\`\`\`

### Step 6: Update Environment Variables

**Backend `.env`:**
\`\`\`env
MONGODB_URI_PRODUCTION=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/SubscriptionManager?retryWrites=true&w=majority
\`\`\`

## 🚢 Vercel Deployment

### Step 1: Prepare for Deployment

**Backend:**
\`\`\`bash
cd backend
# Ensure all dependencies are in package.json
npm install
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
# Test production build
npm run build
\`\`\`

### Step 2: Install Vercel CLI

\`\`\`bash
npm install -g vercel
vercel login
\`\`\`

### Step 3: Deploy Backend

\`\`\`bash
cd backend
vercel

# Follow prompts:
# - Setup and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: subscription-manager-backend
# - Directory: ./
# - Override settings: No
\`\`\`

**Set Environment Variables:**
\`\`\`bash
vercel env add MONGODB_URI_PRODUCTION
# Paste your MongoDB Atlas connection string

vercel env add JWT_SECRET
# Enter a strong secret key

vercel env add JWT_REFRESH_SECRET
# Enter another strong secret key

vercel env add FRONTEND_URL_PRODUCTION
# Enter your frontend URL (will get after frontend deployment)

vercel env add NODE_ENV
# Enter: production
\`\`\`

**Deploy to production:**
\`\`\`bash
vercel --prod
\`\`\`

**Note your backend URL:** `https://your-backend.vercel.app`

### Step 4: Deploy Frontend

\`\`\`bash
cd frontend
vercel

# Follow prompts similar to backend
# Project name: subscription-manager-frontend
\`\`\`

**Set Environment Variables:**
\`\`\`bash
vercel env add REACT_APP_API_URL_PRODUCTION
# Enter: https://your-backend.vercel.app/api/v1

vercel env add REACT_APP_ENV
# Enter: production
\`\`\`

**Deploy to production:**
\`\`\`bash
vercel --prod
\`\`\`

### Step 5: Update Backend with Frontend URL

\`\`\`bash
cd backend
vercel env add FRONTEND_URL_PRODUCTION
# Enter: https://your-frontend.vercel.app

# Redeploy backend
vercel --prod
\`\`\`

### Step 6: Configure Custom Domain (Optional)

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

## 📝 Environment Variables

### Backend (.env)

\`\`\`env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/SubscriptionManager
MONGODB_URI_PRODUCTION=mongodb+srv://...

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_URL_PRODUCTION=https://your-app.vercel.app

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@subscriptionmanager.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
\`\`\`

### Frontend (.env)

\`\`\`env
# API
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_API_URL_PRODUCTION=https://your-backend.vercel.app/api/v1

# App
REACT_APP_NAME=Subscription Manager
REACT_APP_VERSION=2.0.0

# Features
REACT_APP_ENABLE_DARK_MODE=true
REACT_APP_ENABLE_PWA=true

# Environment
REACT_APP_ENV=production
\`\`\`

## 🧪 Testing

### Backend Tests
\`\`\`bash
cd backend
npm test
\`\`\`

### Frontend Tests
\`\`\`bash
cd frontend
npm test
\`\`\`

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/signup
Register a new user.

**Request:**
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Registration successful!"
}
\`\`\`

#### POST /api/v1/auth/login
Authenticate user.

**Request:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
\`\`\`

#### POST /api/v1/auth/refresh-token
Refresh access token.

**Request:**
\`\`\`json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
\`\`\`

### Subscription Endpoints

#### GET /api/v1/subscriptions
Get all user subscriptions.

**Headers:**
\`\`\`
Authorization: Bearer <accessToken>
\`\`\`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (active/paused/cancelled)
- `category` (optional): Filter by category
- `search` (optional): Search by name

**Response:**
\`\`\`json
{
  "success": true,
  "subscriptions": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
\`\`\`

#### POST /api/v1/subscriptions
Create new subscription.

**Headers:**
\`\`\`
Authorization: Bearer <accessToken>
\`\`\`

**Request:**
\`\`\`json
{
  "name": "Netflix",
  "price": 15.99,
  "currency": "USD",
  "billingCycle": "monthly",
  "nextBillingDate": "2024-12-01",
  "category": "Entertainment",
  "description": "Streaming service",
  "status": "active"
}
\`\`\`

### Dashboard Endpoints

#### GET /api/v1/dashboard/stats
Get dashboard statistics.

**Response:**
\`\`\`json
{
  "success": true,
  "stats": {
    "totalSubscriptions": 12,
    "activeSubscriptions": 10,
    "monthlySpending": 156.88,
    "yearlySpending": 1882.56,
    "upcomingPayments": 3
  }
}
\`\`\`

## 🛠️ Development

### Project Structure

\`\`\`
subscription-manager/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── logger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── subscriptionController.js
│   │   ├── categoryController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── security.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Subscription.js
│   │   └── Category.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   └── errors.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   ├── package.json
│   └── vercel.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Auth/
    │   │   ├── Dashboard/
    │   │   ├── Subscriptions/
    │   │   ├── Calendar/
    │   │   ├── Navbar/
    │   │   └── Settings/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── enhancedAuthApi.js
    │   │   └── subscriptionApi.js
    │   ├── theme/
    │   │   ├── theme.js
    │   │   └── ThemeContext.js
    │   ├── App.js
    │   └── index.js
    ├── .env
    ├── .env.example
    ├── package.json
    └── vercel.json
\`\`\`

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting

\`\`\`bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
\`\`\`

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** - Vercel provides this automatically
4. **Regular dependency updates** - Use `npm audit` and `npm update`
5. **Input validation** - Always validate on both frontend and backend
6. **Rate limiting** - Configured for authentication endpoints
7. **CORS configuration** - Only allow trusted origins
8. **SQL injection prevention** - Using Mongoose with sanitization
9. **XSS protection** - Input sanitization and security headers
10. **Password hashing** - Using bcrypt with configurable rounds

## 📈 Performance Optimization

- **Code splitting** - Lazy loading routes
- **Image optimization** - WebP format with fallbacks
- **Compression** - Gzip for API responses
- **Caching** - React Query for data caching
- **Database indexes** - On frequently queried fields
- **Connection pooling** - Optimized MongoDB connections
- **CDN delivery** - Vercel Edge Network

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check port 5000 is not in use

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` is correct
- Check CORS configuration in backend
- Ensure backend is running

### Deployment issues
- Verify all environment variables in Vercel
- Check build logs for errors
- Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Database connection fails
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are always welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) first.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support & Contact

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/Venu22003/subscription-management/issues)
- **Email**: venu22003@example.com
- **Repository**: [github.com/Venu22003/subscription-management](https://github.com/Venu22003/subscription-management)

## 🙏 Acknowledgments

- [Material-UI](https://mui.com/) for the amazing component library
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting
- [Vercel](https://vercel.com) for seamless deployment and hosting
- [Testmail.app](https://testmail.app) for email testing service
- All contributors who have helped improve this project

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/Venu22003/subscription-management)
![GitHub issues](https://img.shields.io/github/issues/Venu22003/subscription-management)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Venu22003/subscription-management)
![GitHub stars](https://img.shields.io/github/stars/Venu22003/subscription-management)

**Status**: ✅ **Production Ready** - Actively maintained

---

<div align="center">

**Built with ❤️ by [Venu Prasad](https://github.com/Venu22003)**

**⭐ Star this repo if you find it helpful!**

[Live Demo](https://subscription-management-frontend-me.vercel.app) • [Report Bug](https://github.com/Venu22003/subscription-management/issues) • [Request Feature](https://github.com/Venu22003/subscription-management/issues)

</div>
