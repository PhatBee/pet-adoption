const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderStatusHistorySchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  fromStatus: String,
  toStatus: String,
  changedBy: { type: Schema.Types.ObjectId, ref: "User" }, // null = system
  actorRole: { type: String, enum: ["user","shop","system","admin"], default: "user" },
  reason: String
}, { timestamps: true });

module.exports = mongoose.model("OrderStatusHistory", orderStatusHistorySchema);