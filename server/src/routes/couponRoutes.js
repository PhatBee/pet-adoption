const express = require("express");
const { validateCoupon } = require("../controllers/couponController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Route để kiểm tra và áp dụng mã giảm giá
router.post('/validate', authenticate, validateCoupon);

module.exports = router;