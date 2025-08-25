const express = require("express");
const { register, verifyOtp, resendOtp } = require("../controllers/authController");
const { login, refreshToken, logout } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimit");
const { requestPasswordResetOtp, resetPasswordWithOtp } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", authenticate, logout);

router.post("/forgot-password", requestPasswordResetOtp); // API: Forgot Password (request)
router.post("/reset-password", resetPasswordWithOtp); // API: Forgot Password (reset)

// demo test
router.get("/me", authenticate, (req, res) => {
  return res.json({ message: "Protected route", user: req.user });
});


module.exports = router;
