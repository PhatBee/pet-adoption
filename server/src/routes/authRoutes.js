const express = require("express");
const { register, verifyOtp, resendOtp } = require("../controllers/authController");
const { login, refreshToken, logout, getMe } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimit");
const { requestPasswordResetOtp, resetPasswordWithOtp } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.get("/refresh", refreshToken); // for axios interceptor demo
router.post("/logout", logout);

router.post("/forgot-password", requestPasswordResetOtp); // API: Forgot Password (request)
router.post("/reset-password", resetPasswordWithOtp); // API: Forgot Password (reset)

router.get("/me", authenticate, getMe);

module.exports = router;
