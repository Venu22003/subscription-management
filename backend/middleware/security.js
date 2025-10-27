/**
 * Security Configuration Middleware
 * Implements comprehensive security measures
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');

/**
 * Apply Helmet security headers
 */
const applyHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });
};

/**
 * Rate limiting middleware
 * Prevents brute force attacks
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max = process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { status: 'error', message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

/**
 * Strict rate limiter for authentication routes
 */
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes.',
});

/**
 * API rate limiter
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/**
 * Data sanitization against NoSQL query injection
 */
const applySanitization = () => {
  return mongoSanitize();
};

/**
 * Data sanitization against XSS
 */
const applyXSSProtection = () => {
  return xss();
};

/**
 * Prevent parameter pollution
 */
const applyHPPProtection = () => {
  return hpp({
    whitelist: [
      'price',
      'billingCycle',
      'nextBillingDate',
      'category',
      'status',
      'reminderDays',
    ],
  });
};

/**
 * Custom security headers
 */
const customSecurityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
};

/**
 * CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.FRONTEND_URL_PRODUCTION,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

module.exports = {
  applyHelmet,
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
  applySanitization,
  applyXSSProtection,
  applyHPPProtection,
  customSecurityHeaders,
  corsOptions,
};
