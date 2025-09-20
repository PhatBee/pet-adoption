const Order = require("../models/Order");

async function getUserOrders(userId) {
  return await Order.find({ userId }).sort({ createdAt: -1 });
}

async function getOrderDetail(orderId, userId) {
  return await Order.findOne({ _id: orderId, userId }).populate("items.productId");
}

module.exports = { getUserOrders, getOrderDetail };