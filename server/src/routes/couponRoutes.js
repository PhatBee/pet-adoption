const express = require("express");
const { validateCoupon, listActiveCoupons } = require("../controllers/couponController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Route để kiểm tra và áp dụng mã giảm giá
router.post('/validate', authenticate, validateCoupon);

// GET - Lấy danh sách khuyến mãi (công khai)
router.get('/', listActiveCoupons);

module.exports = router;