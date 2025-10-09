// models/coupon.model.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true, // Tự động chuyển mã thành chữ hoa
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed_amount'], // Giảm theo % hoặc số tiền cố định
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    minOrderValue: { // Giá trị đơn hàng tối thiểu để áp dụng
        type: Number,
        default: 0,
    },
    expiresAt: { // Ngày hết hạn
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usesCount: { // Số lần đã được sử dụng
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;