// models/coupon.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose; // <-- quan trọng


const CouponApplyType = {
  ALL_PRODUCTS: 'all_products',
  SPECIFIC_PRODUCTS: 'specific_products',
  SPECIFIC_CATEGORIES: 'specific_categories',
  SPECIFIC_PET_TYPES: 'specific_pet_types',
  SPECIFIC_CATEGORIES_AND_PET_TYPES: 'specific_categories_and_pet_types',
};

const DiscountType = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
};


const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true, // Tự động chuyển mã thành chữ hoa
        trim: true,
        index: true,
    },
    discountType: {
        type: String,
        enum: Object.values(DiscountType), // Giảm theo % hoặc số tiền cố định
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
    },
    // Giá trị đơn hàng tối thiểu để áp dụng coupon
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Giá trị giảm tối đa (áp dụng khi discountType = percentage)
    maxDiscountValue: {
      type: Number,
      min: 0,
      default: null,
    },
    // Mô tả ngắn
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Có công khai (các user có thể thấy / tự áp dụng) hay không
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Ngày hết hạn (có thể null = không hết hạn)
    expiresAt: {
      type: Date,
      default: null,
    },

    // Trạng thái hoạt động
    isActive: {
      type: Boolean,
      default: true,
    },
    // Số lần đã được sử dụng
    usesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Số lần tối đa được dùng (toàn bộ coupon)
    maxUses: {
      type: Number,
      min: 0,
      default: null,
    },

    // Giới hạn số lần 1 user có thể dùng (>=1)
    usageLimitPerUser: {
      type: Number,
      min: 1,
      default: 1,
    },

    // Áp dụng cho: tất cả / sản phẩm cụ thể / danh mục / loại thú cưng
    appliesTo: {
      type: String,
      enum: Object.values(CouponApplyType),
      default: CouponApplyType.ALL_PRODUCTS,
    },

    // Danh sách product ids (khi appliesTo = specific_products)
    productIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
      default: [],
    },

    // Danh sách category ids (khi appliesTo = specific_categories)
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
      default: [],
    },

    // Danh sách petType ids (khi appliesTo = specific_pet_types)
    petTypeIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Pet' }],
      default: [],
    },
}, { timestamps: true });

couponSchema.index({ isActive: 1, isPublic: 1, expiresAt: 1 });


const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;