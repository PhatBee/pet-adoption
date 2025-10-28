const Coupon = require("../models/Coupon");

const validateCoupon = async (code, itemsTotal) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    // 1. Kiểm tra tồn tại
    if (!coupon) {
        throw { status: 404, message: 'Mã giảm giá không tồn tại.' };
    }

    // 2. Kiểm tra mã còn hoạt động không
    if (!coupon.isActive) {
        throw { status: 400, message: 'Mã giảm giá đã bị vô hiệu hóa.' };
    }

    // 3. Kiểm tra ngày hết hạn
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw { status: 400, message: 'Mã giảm giá đã hết hạn.' };
    }

    // 4. Kiểm tra giá trị đơn hàng tối thiểu
    if (coupon.minOrderValue > 0 && itemsTotal < coupon.minOrderValue) {
        throw { 
            status: 400, 
            message: `Mã này chỉ áp dụng cho đơn hàng từ ${coupon.minOrderValue.toLocaleString()}đ.` 
        };
    }

    // Nếu mọi thứ hợp lệ, trả về coupon
    return coupon;
}

/**
 * Lấy tất cả các coupon còn hoạt động và chưa hết hạn
 */
const getActiveCoupons = async () => {
  const now = new Date();
  
  const coupons = await Coupon.find({
    isActive: true, //
    expiresAt: { $gt: now } // Chỉ lấy mã chưa hết hạn
  })
  .sort({ expiresAt: 1 }) // Ưu tiên mã sắp hết hạn lên đầu
  .lean(); // .lean() để đọc nhanh hơn
  
  return coupons;
}

module.exports = { validateCoupon, getActiveCoupons };