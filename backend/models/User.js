const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
    refreshTokenExpire: Date,
    // Two-Factor Authentication
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    twoFactorBackupCodes: [String],
    // Security & Activity Tracking
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    passwordChangedAt: Date,
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        location: String,
      },
    ],
    // User Preferences
    preferences: {
      theme: {
        type: String,
        default: "light",
        enum: ["light", "dark", "auto"],
      },
      language: {
        type: String,
        default: "en",
        enum: ["en", "es", "fr", "de"],
      },
      currency: {
        type: String,
        default: "USD",
        uppercase: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      pushNotifications: {
        type: Boolean,
        default: false,
      },
      reminderDays: {
        type: Number,
        default: 3,
        min: [0, "Reminder days cannot be negative"],
        max: [30, "Reminder days cannot exceed 30"],
      },
      dateFormat: {
        type: String,
        default: "MM/DD/YYYY",
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
      },
      weekStartsOn: {
        type: String,
        default: "sunday",
        enum: ["sunday", "monday"],
      },
    },
    // Profile Information
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    phone: String,
    country: String,
    timezone: {
      type: String,
      default: "UTC",
    },
    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: Date,
    // Subscription Plan (for future premium features)
    subscriptionPlan: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      default: "free",
    },
    subscriptionExpiry: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Virtual for checking if account is locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, rounds);
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to limit login history
userSchema.pre("save", function (next) {
  if (this.loginHistory && this.loginHistory.length > 10) {
    this.loginHistory = this.loginHistory.slice(-10); // Keep only last 10 logins
  }
  next();
});

// Query middleware to exclude soft-deleted users
userSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  
  return resetToken;
};

// Method to generate email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
    
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Method to handle failed login attempts
userSchema.methods.handleFailedLogin = async function () {
  this.loginAttempts += 1;
  
  // Lock account after 5 failed attempts
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
  }
  
  await this.save({ validateBeforeSave: false });
};

// Method to handle successful login
userSchema.methods.handleSuccessfulLogin = async function (ipAddress, userAgent) {
  this.lastLogin = Date.now();
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  
  // Add to login history
  this.loginHistory.push({
    timestamp: Date.now(),
    ipAddress,
    userAgent,
  });
  
  await this.save({ validateBeforeSave: false });
};

// Method to soft delete user
userSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  await this.save({ validateBeforeSave: false });
};

// Method to restore soft-deleted user
userSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = undefined;
  await this.save({ validateBeforeSave: false });
};

// Method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

module.exports = mongoose.model("User", userSchema);