/**
 * Enhanced Authentication Middleware with Refresh Token Support
 * Implements JWT access and refresh token mechanism
 */

const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('../utils/errors');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'subscription_secret_key_2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'subscription_refresh_secret_key_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate Access Token
 * Short-lived token for API access
 */
function generateAccessToken(userId, email, additionalData = {}) {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'access',
      ...additionalData 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

/**
 * Generate Refresh Token
 * Long-lived token for obtaining new access tokens
 */
function generateRefreshToken(userId, email) {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  );
}

/**
 * Generate Both Tokens
 * Returns access and refresh tokens
 */
function generateTokens(userId, email, additionalData = {}) {
  const accessToken = generateAccessToken(userId, email, additionalData);
  const refreshToken = generateRefreshToken(userId, email);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRE,
  };
}

/**
 * Verify Access Token
 * Validates the JWT access token
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'access') {
      throw new AuthenticationError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Access token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify Refresh Token
 * Validates the JWT refresh token
 */
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Refresh token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Authentication Middleware
 * Validates access token and attaches user to request
 */
async function validateToken(req, res, next) {
  try {
    // Extract token from multiple sources
    let token = null;

    // 1. Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check cookies
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // 3. Check custom header
    else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      throw new AuthenticationError('Authentication required. Please log in.');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // Log successful authentication
    logger.info('User authenticated', {
      userId: decoded.userId,
      email: decoded.email,
      path: req.path,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      path: req.path,
      ip: req.ip,
    });
    next(error);
  }
}

/**
 * Optional Authentication Middleware
 * Attaches user if token is valid, but doesn't require authentication
 */
async function optionalAuth(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }

    next();
  } catch (error) {
    // Silent fail - continue without user
    next();
  }
}

/**
 * Role-based Authorization Middleware
 * Checks if user has required role
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (roles.length && !roles.includes(req.user.role)) {
      throw new AuthorizationError('You do not have permission to perform this action');
    }

    next();
  };
}

/**
 * Set Token Cookies
 * Helper function to set secure HTTP-only cookies
 */
function setTokenCookies(res, accessToken, refreshToken) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear Token Cookies
 * Helper function to clear authentication cookies
 */
function clearTokenCookies(res) {
  res.cookie('accessToken', '', { maxAge: 0 });
  res.cookie('refreshToken', '', { maxAge: 0 });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  validateToken,
  optionalAuth,
  authorize,
  setTokenCookies,
  clearTokenCookies,
};
