const express = require("express");
const { register } = require("../controllers/authController");
const { verifyOtp } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);


module.exports = router;
