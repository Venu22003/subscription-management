/**
 * Winston Logger Configuration
 * Provides structured logging with different levels and transports
 * Serverless-compatible (uses console only in production)
 */

const winston = require('winston');
const path = require('path');

// Check if running in serverless/production environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configure transports
const transports = [
  // Console transport (always enabled)
  new winston.transports.Console({
    format: isServerless ? logFormat : consoleFormat,
    level: process.env.LOG_LEVEL || 'info',
  }),
];

// Only add file transports in local development (not serverless)
if (!isServerless) {
  const DailyRotateFile = require('winston-daily-rotate-file');
  const logsDir = path.join(__dirname, '../logs');

  transports.push(
    // Error logs - daily rotation
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),

    // Combined logs - daily rotation
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),

    // Info logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'info-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
