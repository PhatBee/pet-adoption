const mongoose = require('mongoose');
const { Schema } = mongoose;

const userCouponSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    // Option: Nếu cần lưu thêm thông tin (ví dụ: orderId khi dùng coupon)
    meta: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index: mỗi user chỉ có 1 record cho 1 coupon
userCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true });
const UserCoupon = mongoose.model('UserCoupon', userCouponSchema);

module.exports = UserCoupon;