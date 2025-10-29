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
        const coupons = await couponService.getActiveCoupons();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách khuyến mãi" });
    }
}

module.exports = {validateCoupon, listActiveCoupons};