/**
 * Subscription Manager Backend - Production Ready
 * Main Application Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

// Import configurations
const { connectDB } = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');

// Import security middleware
const {
  applyHelmet,
  apiRateLimiter,
  applySanitization,
  applyXSSProtection,
  applyHPPProtection,
  customSecurityHeaders,
  corsOptions,
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Initialize Express app
const app = express();

// Trust proxy (required for rate limiting behind reverse proxies like Vercel)
app.set('trust proxy', 1);

// ============================================================================
// MIDDLEWARE - Security & Performance
// ============================================================================

// Security Headers
app.use(applyHelmet());
app.use(customSecurityHeaders);

// CORS Configuration
app.use(cors(corsOptions));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression for responses
app.use(compression());

// Data Sanitization
app.use(applySanitization()); // Against NoSQL injection
app.use(applyXSSProtection()); // Against XSS attacks
app.use(applyHPPProtection()); // Prevent parameter pollution

// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// ============================================================================
// HEALTH CHECK & API INFO
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription Manager API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    database: 'connected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// API ROUTES - Version 1
// ============================================================================

// Apply rate limiting to all API routes
app.use('/api/v1', apiRateLimiter);

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Legacy routes (backwards compatibility) - redirect to v1
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler - Route not found
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

const PORT = process.env.PORT || 5000;

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Seed categories if needed
    const seedCategories = require('./data/seedCategories');
    await seedCategories();
    logger.info('✅ Categories checked/seeded');

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 Subscription Manager API Server Running                  ║
║                                                                ║
║   Environment:  ${process.env.NODE_ENV || 'development'}${' '.repeat(44 - (process.env.NODE_ENV || 'development').length)}║
║   Port:         ${PORT}${' '.repeat(48 - PORT.toString().length)}║
║   URL:          http://localhost:${PORT}${' '.repeat(31 - PORT.toString().length)}║
║   API v1:       http://localhost:${PORT}/api/v1${' '.repeat(24 - PORT.toString().length)}║
║   Health:       http://localhost:${PORT}/health${' '.repeat(24 - PORT.toString().length)}║
║                                                                ║
║   Ready to accept connections! 🎉                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          const { disconnectDB } = require('./config/database');
          await disconnectDB();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================================================
// SERVERLESS SUPPORT (Vercel)
// ============================================================================

// For serverless environments, connect to database on module load
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const { connectDBServerless } = require('./config/database');
  
  // Connect to database for serverless
  connectDBServerless()
    .then(() => {
      logger.info('✅ Serverless database connection established');
      
      // Seed categories for serverless
      const seedCategories = require('./data/seedCategories');
      return seedCategories();
    })
    .then(() => {
      logger.info('✅ Serverless categories checked/seeded');
    })
    .catch((error) => {
      logger.error('❌ Serverless database connection failed:', error);
    });
}

// Start the server (only for local development)
if (require.main === module) {
  startServer();
}

module.exports = app;