const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * Lấy danh sách đơn hàng của user theo pagination (page-based)
 * @param {ObjectId} userId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Object} { items, total, page, limit }
 */
async function fetchUserOrders(userId, page = 1, limit = 10) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

  const skip = (p - 1) * l;

  // lấy tổng & items song song
  const [total, items] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean()
  ]);

  return { items, total, page: p, limit: l };

  // return await Order.find({ userId }).sort({ createdAt: -1 });
}

async function getUserOrderById(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  return order;
}   

async function updateOrderStatus(orderId, newStatus) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.status = newStatus;

  order.orderStatusHistory.push({
    status: newStatus,
    changedAt: new Date()
  });

  await order.save();
  return order;
}

async function cancelOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw { status: 404, message: "Order not found" };

  // chỉ cho phép hủy trong vòng 30 phút và khi đang pending/confirmed
  if (order.cancellableUntil && new Date() > order.cancellableUntil) {
    throw { status: 400, message: "Order can no longer be cancelled" };
  }
  if (!["pending", "confirmed"].includes(order.status)) {
    throw { status: 400, message: "Order cannot be cancelled in current status" };
  }

  order.status = "cancelled";
  order.orderStatusHistory.push({ status: "cancelled", changedAt: new Date(), actorRole: "user" });

  await order.save();
  return order;
}

module.exports = { getUserOrderById, fetchUserOrders, updateOrderStatus, cancelOrder };