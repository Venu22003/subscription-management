<div align="center">

# 🚀 Subscription Manager

### Track All Your Subscriptions in One Beautiful Dashboard

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge&logo=vercel)](https://subscription-management-app.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/Venu22003/subscription-management?style=for-the-badge&logo=github)](https://github.com/Venu22003/subscription-management/stargazers)

*A modern, full-stack subscription management application built with the MERN stack*

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 📸 Preview

<div align="center">

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/667eea/ffffff?text=Dashboard+Preview)

### Subscription Management
<p>
  <img src="https://via.placeholder.com/380x250/764ba2/ffffff?text=List+View" width="49%" />
  <img src="https://via.placeholder.com/380x250/667eea/ffffff?text=Calendar+View" width="49%" />
</p>

### Dark Mode Support
<p>
  <img src="https://via.placeholder.com/380x250/1a237e/ffffff?text=Light+Mode" width="49%" />
  <img src="https://via.placeholder.com/380x250/0d47a1/ffffff?text=Dark+Mode" width="49%" />
</p>

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Subscription Management
- ✅ Create, edit, delete subscriptions
- ✅ 15+ pre-defined categories with icons
- ✅ Track billing cycles (monthly/yearly/weekly)
- ✅ Payment status management
- ✅ Auto-renewal tracking
- ✅ Payment history logging

</td>
<td width="50%">

### 📊 Analytics & Insights
- ✅ Total spending overview
- ✅ Active subscriptions count
- ✅ Upcoming payments tracker
- ✅ Category breakdown charts
- ✅ Monthly/yearly projections
- ✅ Recent activity timeline

</td>
</tr>
<tr>
<td width="50%">

### 🔐 Security & Auth
- ✅ JWT dual-token authentication
- ✅ Bcrypt password hashing
- ✅ Rate limiting protection
- ✅ XSS & injection prevention
- ✅ Secure session management
- ✅ Password reset flow

</td>
<td width="50%">

### 🎨 User Experience
- ✅ Dark mode with persistence
- ✅ Responsive design (mobile-first)
- ✅ Payment calendar visualization
- ✅ Real-time form validation
- ✅ Toast notifications
- ✅ Smooth animations

</td>
</tr>
</table>

---

## 🎯 Demo

### Live Application
Experience the app in action → **[Launch Demo](https://your-demo-link.vercel.app)**

### Test Credentials
```
Email: demo@example.com
Password: Demo123!@#
```

> 💡 Or create your own account to explore all features!

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Material-UI](https://img.shields.io/badge/MUI-5.14-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Framer](https://img.shields.io/badge/Framer_Motion-10.16-0055FF?style=for-the-badge&logo=framer&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

### DevOps
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

</div>

### Complete Technology Overview

```
Frontend               Backend                Database
├─ React 18           ├─ Node.js 18+         ├─ MongoDB Atlas
├─ Material-UI 5      ├─ Express 4           ├─ Mongoose ODM
├─ React Query        ├─ JWT Auth            └─ Connection Pool
├─ React Hook Form    ├─ Bcrypt              
├─ Framer Motion      ├─ Winston             DevOps
├─ Recharts           ├─ Nodemailer          ├─ Vercel Serverless
└─ Axios              └─ Helmet              ├─ GitHub CI/CD
                                              └─ Environment Vars
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local or Atlas)

### Installation

1️⃣ **Clone the repository**
```bash
git clone https://github.com/Venu22003/subscription-management.git
cd subscription-management
```

2️⃣ **Backend setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

3️⃣ **Frontend setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm start
```

4️⃣ **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Docs: http://localhost:5000/api/v1

### Environment Variables

<details>
<summary>Click to expand backend variables</summary>

```env
# Database
MONGODB_URI=mongodb://localhost:27017/SubscriptionManager

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# URLs
FRONTEND_URL=http://localhost:3000

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```
</details>

<details>
<summary>Click to expand frontend variables</summary>

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_ENV=development
```
</details>

---

## 📚 Documentation

<table>
<tr>
<td align="center" width="33%">

### 📖 [Quick Start](docs/QUICKSTART.md)
Get up and running in 5 minutes

</td>
<td align="center" width="33%">

### 🚀 [Deployment](docs/DEPLOYMENT.md)
Deploy to production step-by-step

</td>
<td align="center" width="33%">

### 🔌 [API Docs](docs/API.md)
Complete API endpoint reference

</td>
</tr>
<tr>
<td align="center" width="33%">

### 🤝 [Contributing](docs/CONTRIBUTING.md)
How to contribute to the project

</td>
<td align="center" width="33%">

### 📋 [Changelog](CHANGELOG.md)
Version history and updates

</td>
<td align="center" width="33%">

### 📄 [License](LICENSE)
MIT License details

</td>
</tr>
</table>

---

## 🏗️ Project Structure

```
subscription-management/
├── 📁 backend/
│   ├── 📁 config/          # Database & logger configs
│   ├── 📁 controllers/     # Business logic
│   ├── 📁 middleware/      # Auth, validation, security
│   ├── 📁 models/          # Mongoose schemas
│   ├── 📁 routes/          # API endpoints
│   ├── 📁 services/        # Email service
│   ├── 📄 index.js         # Entry point
│   └── 📄 vercel.json      # Deployment config
│
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # React components
│   │   ├── 📁 context/     # Global state
│   │   ├── 📁 services/    # API services
│   │   ├── 📁 theme/       # MUI theming
│   │   └── 📄 App.js       # Main component
│   └── 📄 vercel.json      # Deployment config
│
└── 📁 docs/                # Documentation
```

---

## 🎨 Screenshots

<details>
<summary>Click to view all screenshots</summary>

### Authentication
<p align="center">
  <img src="https://via.placeholder.com/600x400/667eea/ffffff?text=Login+Page" width="45%" />
  <img src="https://via.placeholder.com/600x400/764ba2/ffffff?text=Signup+Page" width="45%" />
</p>

### Dashboard
<p align="center">
  <img src="https://via.placeholder.com/900x500/667eea/ffffff?text=Dashboard+Overview" width="90%" />
</p>

### Subscription Management
<p align="center">
  <img src="https://via.placeholder.com/600x400/764ba2/ffffff?text=List+View" width="45%" />
  <img src="https://via.placeholder.com/600x400/667eea/ffffff?text=Add+Subscription" width="45%" />
</p>

### Calendar & Analytics
<p align="center">
  <img src="https://via.placeholder.com/600x400/667eea/ffffff?text=Payment+Calendar" width="45%" />
  <img src="https://via.placeholder.com/600x400/764ba2/ffffff?text=Analytics+Charts" width="45%" />
</p>

</details>

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/auth/refresh-token` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |
| POST | `/api/v1/auth/forgot-password` | Request password reset |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions` | Get all subscriptions |
| POST | `/api/v1/subscriptions` | Create subscription |
| GET | `/api/v1/subscriptions/:id` | Get single subscription |
| PUT | `/api/v1/subscriptions/:id` | Update subscription |
| DELETE | `/api/v1/subscriptions/:id` | Delete subscription |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Get statistics |
| GET | `/api/v1/dashboard/spending` | Get spending data |
| GET | `/api/v1/dashboard/upcoming` | Get upcoming payments |

📖 [View Complete API Documentation →](docs/API.md)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💻 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔀 Open a Pull Request

📖 Read our [Contributing Guidelines](docs/CONTRIBUTING.md) for more details.

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature idea?

- 🐞 [Report a Bug](https://github.com/Venu22003/subscription-management/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/Venu22003/subscription-management/issues/new?template=feature_request.md)
- 💬 [Ask a Question](https://github.com/Venu22003/subscription-management/discussions)

---

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/Venu22003/subscription-management?style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/Venu22003/subscription-management?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/Venu22003/subscription-management?style=flat-square)
![GitHub pull requests](https://img.shields.io/github/issues-pr/Venu22003/subscription-management?style=flat-square)

**Status:** ✅ **Production Ready** - Actively Maintained

---

## 🎯 Roadmap

### Version 2.1.0 (Coming Soon)
- [ ] Email verification on signup
- [ ] Two-factor authentication (2FA)
- [ ] Data export (CSV/PDF)
- [ ] Bulk operations
- [ ] Mobile notifications

### Version 2.2.0
- [ ] Social authentication (Google, GitHub)
- [ ] Family sharing features
- [ ] Advanced analytics
- [ ] Custom categories with icons
- [ ] Multi-language support

### Version 3.0.0
- [ ] AI-powered recommendations
- [ ] Price tracking
- [ ] Banking API integration
- [ ] Chrome extension
- [ ] Mobile app (React Native)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Venu Prasad**

[![GitHub](https://img.shields.io/badge/GitHub-Venu22003-181717?style=for-the-badge&logo=github)](https://github.com/Venu22003)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/venu-prasad)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://venu-prasad.vercel.app)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:venu22003@example.com)

</div>

---

## 🌟 Show Your Support

If you found this project helpful, please consider:

- ⭐ Starring the repository
- 🍴 Forking the project
- 📢 Sharing with your network
- 🐛 Reporting bugs
- 💡 Suggesting new features

---

## 🙏 Acknowledgments

- [Material-UI](https://mui.com/) - UI Component Library
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Database Hosting
- [Vercel](https://vercel.com) - Deployment Platform
- [React](https://react.dev) - Frontend Framework
- [Express](https://expressjs.com) - Backend Framework

---

<div align="center">

### Built with ❤️ using MERN Stack

**[⬆ Back to Top](#-subscription-manager)**

</div>