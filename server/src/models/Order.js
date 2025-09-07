const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    status: { type: String, default: "pending" },      // pending | paid | shipped | completed | cancelled
    paymentStatus: { type: String, default: "unpaid" } // unpaid | paid | refunded
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, paymentStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);