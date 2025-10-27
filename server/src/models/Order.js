const mongoose = require("mongoose");

const orderStatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  reason: { type: String, default: null }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productSnapshot: { type: Object, required: true }, // lưu trữ thông tin sản phẩm tại thời điểm đặt hàng
  quantity: { type: Number, required: true },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: String, phone: String, street: String,
  ward: String, district: String, city: String
}, { _id: false });

// Thêm cấu trúc cho paymentInfo
const paymentInfoSchema = new mongoose.Schema({
  // VNPAY fields
  vnpTranNo: String,
  vnpBankCode: String,
  vnpPayDate: String,
  // MOMO fields
  momoTransId: String, // Thêm trường này
  momoPayType: String, // Thêm trường này (ví dụ: qr, app)
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  paymentMethod: { type: String, enum: ["COD", "VNPAY", "MOMO"], default: "COD" },
  paymentInfo: paymentInfoSchema, // Sử dụng schema mới
  itemsTotal: { type: Number, required: true },

  // -- THÊM CÁC TRƯỜNG KHUYẾN MÃI VÀ ĐIỂM TÍCH LŨY Ở ĐÂY --
  couponCode: { type: String },
  couponDiscount: { type: Number, default: 0 },
  pointsUsed: { type: Number, default: 0 },
  pointsDiscount: { type: Number, default: 0 }, // Giả sử 1 điểm = 1đ
  // ---------------------------------

  total: { type: Number, required: true },
  status: { type: String, default: "pending", enum: ["pending","confirmed", "preparing","shipping", "delivered","cancelled","cancel_requested","refunded"] },
  orderedAt: { type: Date },
  deliveredAt: { type: Date },
  autoConfirmJobId: { type: String, default: null },
  orderStatusHistory: [orderStatusHistorySchema],
  cancellableUntil: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 60 * 1000) 
  },
  expiresAt: { type: Date, default: null }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
