const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/authController");
const { validateToken, optionalAuth } = require("../middleware/authMiddleware");
const { authRateLimiter } = require("../middleware/security");
const {
  validate,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} = require("../middleware/validation");

// Public routes with strict rate limiting
router.post("/signup", authRateLimiter, validate(signupSchema), signup);
router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.get("/verify-email/:token", verifyEmail);

// Protected routes
router.post("/logout", optionalAuth, logout);
router.get("/profile", validateToken, getProfile);
router.put("/profile", validateToken, validate(updateProfileSchema), updateProfile);
router.post("/change-password", validateToken, changePassword);
router.delete("/account", validateToken, deleteAccount);

module.exports = router;