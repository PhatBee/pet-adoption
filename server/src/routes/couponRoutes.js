const express = require("express");
const { validateCoupon, listActiveCoupons, saveCoupon, listSavedCoupons } = require("../controllers/couponController");
const { authenticate, authenticateOptional } = require("../middleware/authMiddleware");
// 2. Giả sử bạn có 1 middleware "authenticateOptional"
// Nếu không, ta sẽ dùng "authenticate" cho cả hai
// const { authenticateOptional } = require("../middleware/authMiddleware");

const router = express.Router();

// Route để kiểm tra và áp dụng mã giảm giá
router.post('/validate', authenticate, validateCoupon);

// Route để lưu mã giảm giá (yêu cầu đăng nhập)
router.post('/save', authenticate, saveCoupon); // 3. Thêm route mới

// GET - Lấy danh sách khuyến mãi (công khai, nhưng check auth để biết 'isSaved')
// 4. Dùng 'authenticate'. Trang này giờ sẽ yêu cầu đăng nhập
//    Nếu bạn muốn trang này công khai, bạn cần 1 middleware "authenticateOptional"
//    và sửa controller để xử lý req.user có thể null.
//    Theo logic "Lưu mã", yêu cầu đăng nhập là hợp lý.
router.get('/', authenticateOptional, listActiveCoupons);

// 2. Route MỚI: Lấy mã đã lưu (yêu cầu đăng nhập)
router.post('/saved', authenticate, listSavedCoupons);



module.exports = router;