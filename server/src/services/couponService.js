const Coupon = require("../models/Coupon");
const UserCoupon = require("../models/UserCoupon"); // 1. Import UserCoupon

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
 * Lấy tất cả các coupon CÔNG KHAI, còn hoạt động và chưa hết hạn
 * userId (tùy chọn): Nếu được cung cấp, sẽ kiểm tra xem user đã lưu coupon nào
 */
const getActiveCoupons = async (userId = null) => {
  const now = new Date();
  
  const coupons = await Coupon.find({
    isActive: true, //
    isPublic: true, // 2. Chỉ lấy các coupon công khai
    expiresAt: { $gt: now } // Chỉ lấy mã chưa hết hạn
  })
  .sort({ expiresAt: 1 }) // Ưu tiên mã sắp hết hạn lên đầu
  .lean(); // .lean() để đọc nhanh hơn

  // 3. Nếu có userId, kiểm tra xem coupon nào đã được lưu
  if (userId) {
    const savedCoupons = await UserCoupon.find({ 
      userId, 
      couponId: { $in: coupons.map(c => c._id) } 
    }).select('couponId');

    const savedCouponIds = new Set(savedCoupons.map(sc => sc.couponId.toString()));

    // Thêm cờ isSaved vào mỗi coupon
    return coupons.map(coupon => ({
      ...coupon,
      isSaved: savedCouponIds.has(coupon._id.toString()),
    }));
  }
  
  // Nếu không có userId, trả về danh sách coupon_gốc (không có cờ isSaved)
  return coupons;
}

/**
 * 4. Thêm hàm mới: Lưu coupon cho user
 */
const saveCouponForUser = async (userId, couponId) => {
  // Kiểm tra coupon có tồn tại và hợp lệ không
  const coupon = await Coupon.findOne({
    _id: couponId,
    isActive: true,
    isPublic: true,
    expiresAt: { $gt: new Date() }
  });

  if (!coupon) {
    throw { status: 404, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." };
  }

  // Kiểm tra xem đã lưu chưa
  const existingSave = await UserCoupon.findOne({ userId, couponId });
  if (existingSave) {
    throw { status: 400, message: "Bạn đã lưu mã này rồi." };
  }

  // Tạo bản ghi mới
  const userCoupon = new UserCoupon({
    userId,
    couponId
  });

  await userCoupon.save();
  return userCoupon;
}

module.exports = { validateCoupon, getActiveCoupons, saveCouponForUser };