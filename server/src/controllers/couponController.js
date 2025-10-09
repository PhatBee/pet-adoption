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

        const coupon = await validateCoupon(code, itemsTotal);
         // Trả về thông tin coupon hợp lệ
        res.json({ message: 'Áp dụng mã giảm giá thành công!', coupon });

    } catch (error) {
        // Bắt các lỗi cụ thể từ service
        res.status(error.status || 400).json({ message: error.message || 'Mã giảm giá không hợp lệ' });
    }
}

module.exports = {validateCoupon};