const User = require("../models/User");
const crypto = require("crypto");
const logger = require("../config/logger");
const {
  generateTokens,
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies,
} = require("../middleware/authMiddleware");
const {
  AuthenticationError,
  ValidationError,
  ConflictError,
  NotFoundError,
} = require("../utils/errors");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../services/emailService");

/**
 * User Signup/Registration
 * Creates new user account with email verification
 */
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email }).select("+isDeleted");
    if (existingUser && !existingUser.isDeleted) {
      throw new ConflictError("Email already registered");
    }

    // If user was soft-deleted, restore account
    if (existingUser && existingUser.isDeleted) {
      existingUser.name = name;
      existingUser.password = password;
      existingUser.isDeleted = false;
      existingUser.deletedAt = undefined;
      await existingUser.save();

      logger.info("User account restored", { userId: existingUser._id, email });

      return res.status(200).json({
        success: true,
        message: "Account restored successfully. Please log in.",
      });
    }

    // Create new user
    const user = new User({ name, email, password });

    // Generate email verification token (if email service is configured)
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const verificationToken = user.getEmailVerificationToken();
      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(email, name);
        logger.info("Welcome email sent successfully", {
          userId: user._id,
          email: user.email,
        });
      } catch (emailError) {
        logger.error("Failed to send welcome email", {
          userId: user._id,
          email: user.email,
          error: emailError.message,
        });
        // Don't fail signup if email fails
      }

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      logger.info("User registered - verification email required", {
        userId: user._id,
        email: user.email,
        verificationUrl,
      });

      return res.status(201).json({
        success: true,
        message:
          "Registration successful! Please check your email for verification link.",
        verificationUrl, // Remove in production
      });
    }

    // If email service not configured, auto-verify
    user.isEmailVerified = true;
    await user.save();

    logger.info("User registered successfully", {
      userId: user._id,
      email: user.email,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful! You can now log in.",
    });
  } catch (error) {
    console.error("=== SIGNUP ERROR ===");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Stack:", error.stack);
    console.error("==================");
    logger.error("Signup error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    next(error);
  }
}

/**
 * User Login
 * Authenticates user and returns access + refresh tokens
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new NotFoundError("Invalid email or password");
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTimeRemaining = Math.ceil(
        (user.lockUntil - Date.now()) / 60000
      );
      throw new AuthenticationError(
        `Account is locked due to too many failed login attempts. Please try again in ${lockTimeRemaining} minutes.`
      );
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.handleFailedLogin();
      throw new AuthenticationError("Invalid email or password");
    }

    // Check email verification (if enabled)
    if (
      process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
      !user.isEmailVerified
    ) {
      throw new AuthenticationError(
        "Please verify your email before logging in"
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id,
      user.email,
      { role: user.role }
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Handle successful login
    await user.handleSuccessfulLogin(req.ip, req.get("user-agent"));

    // Set secure cookies
    setTokenCookies(res, accessToken, refreshToken);

    logger.info("User logged in successfully", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh Access Token
 * Generates new access token using refresh token
 */
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body || req.cookies;

    if (!refreshToken) {
      throw new AuthenticationError("Refresh token is required");
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and verify stored refresh token
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.refreshToken !== refreshToken) {
      throw new AuthenticationError("Invalid refresh token");
    }

    if (user.refreshTokenExpire < Date.now()) {
      throw new AuthenticationError("Refresh token has expired. Please log in again.");
    }

    // Generate new tokens
    const tokens = generateTokens(user._id, user.email, { role: user.role });

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Set new cookies
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    logger.info("Access token refreshed", { userId: user._id });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * User Logout
 * Invalidates refresh token and clears cookies
 */
async function logout(req, res, next) {
  try {
    const userId = req.user?.userId;

    if (userId) {
      // Clear refresh token from database
      await User.findByIdAndUpdate(userId, {
        refreshToken: undefined,
        refreshTokenExpire: undefined,
      });

      logger.info("User logged out", { userId });
    }

    // Clear cookies
    clearTokenCookies(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Forgot Password
 * Generates password reset token and sends email
 */
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.status(200).json({
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
      logger.info("Password reset email sent successfully", {
        userId: user._id,
        email: user.email,
      });
    } catch (emailError) {
      logger.error("Failed to send password reset email", {
        userId: user._id,
        email: user.email,
        error: emailError.message,
      });
      // Continue anyway - user can contact support
    }

    logger.info("Password reset requested", {
      userId: user._id,
      email: user.email,
      resetUrl,
    });

    return res.status(200).json({
      success: true,
      message:
        "If your email is registered, you will receive a password reset link",
      resetUrl, // Remove in production
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reset Password
 * Resets user password using valid reset token
 */
async function resetPassword(req, res, next) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token and find user
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ValidationError(
        "Password reset token is invalid or has expired"
      );
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    logger.info("Password reset successful", {
      userId: user._id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify Email
 * Verifies user email using verification token
 */
async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    // Hash token and find user
    const emailVerificationToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ValidationError(
        "Email verification token is invalid or has expired"
      );
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    logger.info("Email verified successfully", {
      userId: user._id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get User Profile
 * Returns current user's profile information
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).select("-refreshToken");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update User Profile
 * Updates user profile information
 */
async function updateProfile(req, res, next) {
  try {
    const { name, bio, phone, country, timezone, preferences, avatar } =
      req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Update allowed fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (timezone) user.timezone = timezone;
    if (avatar !== undefined) user.avatar = avatar;

    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    logger.info("Profile updated", { userId: user._id });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Change Password
 * Changes user password (requires current password)
 */
async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId).select("+password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AuthenticationError("Current password is incorrect");
    }

    // Set new password
    user.password = newPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    logger.info("Password changed", { userId: user._id });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Account
 * Soft deletes user account
 */
async function deleteAccount(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await user.softDelete();

    logger.info("Account deleted", { userId: user._id });

    // Clear cookies
    clearTokenCookies(res);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
};