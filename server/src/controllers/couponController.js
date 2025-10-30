const couponService = require("../services/couponService");

const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const { itemsTotal } = req.body; // Lấy tổng tiền tạm tính từ frontend

        if (!code) {
            return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
        }
        if (itemsTotal === undefined || itemsTotal < 0) {
            return res.status(400).json({ message: 'Tổng tiền không hợp lệ' });
        }

        const coupon = await couponService.validateCoupon(code, itemsTotal);
         // Trả về thông tin coupon hợp lệ
        res.json({ message: 'Áp dụng mã giảm giá thành công!', coupon });

    } catch (error) {
        // Bắt các lỗi cụ thể từ service
        res.status(error.status || 400).json({ message: error.message || 'Mã giảm giá không hợp lệ' });
    }
}

/**
 * Controller lấy danh sách coupon đang hoạt động
 */
const listActiveCoupons = async (req, res) => {
    try {
        // 1. Lấy userId từ middleware (nếu có). req.user có thể là null
        const userId = req.user?.id || null;
        const coupons = await couponService.getActiveCoupons(userId);
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách khuyến mãi: ", error: error.message });
    }
}

/**
 * 2. Thêm controller mới: Lưu coupon
 */
const saveCoupon = async (req, res) => {
  try {
    const userId = req.user.id; // Yêu cầu đăng nhập
    const { couponId } = req.body;

    if (!couponId) {
      return res.status(400).json({ message: "Thiếu Coupon ID" });
    }
    
    await couponService.saveCouponForUser(userId, couponId);
    res.status(201).json({ message: "Lưu mã giảm giá thành công!" });

  } catch (error) {
    res.status(error.status || 400).json({ message: error.message || 'Lưu mã thất bại' });
  }
}

module.exports = {validateCoupon, listActiveCoupons, saveCoupon};