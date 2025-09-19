const Order = require("../models/Order");
const { changeStatus, cancelOrderByUser } = require("../services/orderService");

// exports.getMyOrders = async (req, res) => {
//   const orders = await Order.find({ user: req.user._id }).populate("items.product", "name price images");
//   res.json(orders);
// };

// Danh sách đơn hàng
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
}

// Chi tiết đơn hàng
const getOrderDetails = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Không thể xem đơn hàng" });
  res.json(order);
}

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
  try {
    const result = await cancelOrderByUser(req.params.id, req.user._id, req.body.reason);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Cập nhật trạng thái đơn hàng
const changeOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const updated = await changeStatus(req.params.id, status, req.user._id, reason);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {getOrderDetails, getMyOrders, cancelOrder, changeOrderStatus}