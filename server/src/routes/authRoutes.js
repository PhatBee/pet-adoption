const express = require("express");
const { register, verifyOtp, resendOtp } = require("../controllers/authController");
const { login, refreshToken, logout } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticate, logout);

// demo test
router.get("/me", authenticate, (req, res) => {
  return res.json({ message: "Protected route", user: req.user });
});

module.exports = router;
