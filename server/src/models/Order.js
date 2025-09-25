const mongoose = require("mongoose");

const orderStatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now }
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

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  shippingAddress: addressSchema,
  paymentMethod: { type: String, enum: ["COD", "VNPAY"], default: "COD" },
  itemsTotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: "pending", enum: ["pending","confirmed", "preparing","shipping", "delivered","cancelled","cancel_requested"] },
  orderedAt: { type: Date },
  deliveredAt: { type: Date },
  autoConfirmJobId: { type: String, default: null },
  orderStatusHistory: [orderStatusHistorySchema],
  cancellableUntil: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 60 * 1000) 
  },

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
