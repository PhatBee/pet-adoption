import express from 'express';
import { validateCoupon } from '../controllers/couponController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Route để kiểm tra và áp dụng mã giảm giá
router.post('/validate', authenticate, validateCoupon);

module.exports = router;