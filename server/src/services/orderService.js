const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function getUserOrders(userId) {
  return await Order.find({ userId }).sort({ createdAt: -1 });
}

async function getOrderDetail(orderId, userId) {
  return await Order.findOne({ _id: orderId, userId }).populate("items.productId");
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

module.exports = { getUserOrders, getOrderDetail, updateOrderStatus, cancelOrder };