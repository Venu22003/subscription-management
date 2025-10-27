/**
 * Request Validation Middleware using Joi
 * Provides comprehensive input validation
 */

const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Allow unknown keys that will be ignored
      stripUnknown: true, // Remove unknown keys from the validated data
    };

    const { error, value } = schema.validate(req.body, validationOptions);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw new ValidationError(errorMessage);
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

/**
 * Validation Schemas
 */

// User Signup Validation
const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().trim().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// User Login Validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

// Forgot Password Validation
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().lowercase().trim().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
});

// Reset Password Validation
const resetPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

// Update Profile Validation
const updateProfileSchema = Joi.object({
  name: Joi.string().min(1).max(50).allow('').optional().trim().messages({
    'string.min': 'Name must be at least 1 character long',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark'),
    emailNotifications: Joi.boolean(),
    reminderDays: Joi.number().min(1).max(30),
    currency: Joi.string().length(3).uppercase(),
    language: Joi.string().valid('en', 'es', 'fr', 'de'),
  }).optional(),
});

// Subscription Validation
const subscriptionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().trim().messages({
    'string.empty': 'Subscription name is required',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Price must be a valid number',
    'number.positive': 'Price must be positive',
  }),
  currency: Joi.string().length(3).uppercase().default('USD'),
  billingCycle: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
    .required()
    .messages({
      'any.only': 'Billing cycle must be daily, weekly, monthly, quarterly, or yearly',
    }),
  nextBillingDate: Joi.date().iso().greater('now').required().messages({
    'date.base': 'Next billing date must be a valid date',
    'date.greater': 'Next billing date must be in the future',
  }),
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
  }),
  description: Joi.string().max(500).allow('').trim(),
  website: Joi.string().uri().allow(''),
  status: Joi.string().valid('active', 'paused', 'cancelled').default('active'),
  reminderDays: Joi.number().min(0).max(30).default(3),
  autoRenew: Joi.boolean().default(true),
  notes: Joi.string().max(1000).allow(''),
});

// Update Subscription Validation
const updateSubscriptionSchema = Joi.object({
  name: Joi.string().min(1).max(100).trim(),
  price: Joi.number().positive().precision(2),
  currency: Joi.string().length(3).uppercase(),
  billingCycle: Joi.string().valid('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
  nextBillingDate: Joi.date().iso().greater('now'),
  category: Joi.string(),
  description: Joi.string().max(500).allow(''),
  website: Joi.string().uri().allow(''),
  status: Joi.string().valid('active', 'paused', 'cancelled'),
  reminderDays: Joi.number().min(0).max(30),
  autoRenew: Joi.boolean(),
  notes: Joi.string().max(1000).allow(''),
});

// Category Validation
const categorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required().trim().messages({
    'string.empty': 'Category name is required',
    'string.max': 'Name cannot exceed 50 characters',
  }),
  icon: Joi.string().max(50),
  color: Joi.string().pattern(new RegExp('^#[0-9A-Fa-f]{6}$')).messages({
    'string.pattern.base': 'Color must be a valid hex color code',
  }),
  description: Joi.string().max(200).allow(''),
});

// Query Validation
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('name', '-name', 'price', '-price', 'nextBillingDate', '-nextBillingDate'),
  status: Joi.string().valid('active', 'paused', 'cancelled'),
  category: Joi.string(),
  search: Joi.string().trim(),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  subscriptionSchema,
  updateSubscriptionSchema,
  categorySchema,
  querySchema,
};
