/**
 * MongoDB Database Configuration
 * Implements connection pooling and error handling for both local and Atlas
 */

const mongoose = require('mongoose');
const logger = require('./logger');

// MongoDB connection options optimized for serverless and production
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
  // Connection pool settings
  maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000, // Increased for serverless cold starts
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // For serverless functions
  bufferCommands: false,
  autoIndex: process.env.NODE_ENV !== 'production',
};

// Get MongoDB URI based on environment
const getMongoURI = () => {
  // Use MONGODB_URI for all environments
  return process.env.MONGODB_URI || 'mongodb://localhost:27017/SubscriptionManager';
};

/**
 * Connect to MongoDB
 * Handles connection with retry logic
 */
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = getMongoURI();
    
    // Mask password in logs
    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    logger.info(`Attempting to connect to MongoDB: ${maskedURI}`);

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    logger.info(`🔗 Connection Pool Size: Min=${options.minPoolSize}, Max=${options.maxPoolSize}`);

    // Connection event handlers
    setupConnectionHandlers();

    return conn;
  } catch (error) {
    logger.error('❌ MongoDB Connection Error:', {
      message: error.message,
      code: error.code,
    });

    if (retries > 0) {
      logger.warn(`Retrying connection... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB(retries - 1);
    }

    logger.error('💥 Failed to connect to MongoDB after multiple attempts');
    process.exit(1);
  }
};

/**
 * Setup connection event handlers
 */
const setupConnectionHandlers = () => {
  // Connection events
  mongoose.connection.on('connected', () => {
    logger.info('✅ Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('❌ Mongoose connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ Mongoose disconnected from MongoDB');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('✅ Mongoose reconnected to MongoDB');
  });

  // Process termination handlers
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('🛑 Mongoose connection closed due to app termination (SIGINT)');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    logger.info('🛑 Mongoose connection closed due to app termination (SIGTERM)');
    process.exit(0);
  });
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('🛑 MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};

/**
 * Check database connection status
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection stats
 */
const getConnectionStats = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: states[state],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.connection.models),
  };
};

/**
 * Cached connection for serverless environments
 * Prevents creating new connections on every request
 */
let cachedConnection = null;

const connectDBServerless = async () => {
  if (cachedConnection && isConnected()) {
    logger.info('Using cached database connection');
    return cachedConnection;
  }

  logger.info('Creating new database connection');
  cachedConnection = await connectDB();
  return cachedConnection;
};

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionStats,
  connectDBServerless,
};
