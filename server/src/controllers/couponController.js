const couponService = require("../services/couponService");

const validateCoupon = async (req, res) => {
    try {
        const { code, items } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });
        }
        // THAY ĐỔI: Kiểm tra mảng items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Không có sản phẩm để áp dụng mã' });
        }

        // Truyền items vào service
        const { coupon, discountAmount } = await couponService.validateCoupon(code, items);

        // Trả về coupon VÀ số tiền giảm
        res.json({ message: 'Áp dụng mã giảm giá thành công!', coupon, discountAmount });

    } catch (error) {
        // Bắt các lỗi cụ thể từ service
        res.status(error.status || 400).json({ message: error.message || 'Mã giảm giá không hợp lệ' });
    }
}

/**
 * Controller MỚI: Lấy danh sách coupon đã lưu cho trang checkout
 */
const listSavedCoupons = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items } = req.body; // Nhận danh sách sản phẩm
        
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Không có thông tin sản phẩm' });
        }

        const coupons = await couponService.getSavedCouponsForCheckout(userId, items);
        res.json(coupons); // Trả về danh sách đã sắp xếp
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách mã đã lưu", error: error.message });
    }
};

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

module.exports = {validateCoupon, listActiveCoupons, saveCoupon, listSavedCoupons};