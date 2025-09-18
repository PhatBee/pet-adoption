const express = require("express");
const express = require("express");
const router = express.Router();
const { changeStatus, cancelOrderByUser } = require("../services/orderService");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

// danh sách đơn của user
router.get("/my-orders", auth, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// chi tiết đơn
router.get("/:id", auth, async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");
  if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Không thể xem đơn hàng" });
  res.json(order);
});

// user hủy
router.post("/:id/cancel", auth, async (req, res) => {
  try {
    const result = await cancelOrderByUser(req.params.id, req.user._id, req.body.reason);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//cập nhật trạng thái
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const updated = await changeStatus(req.params.id, status, req.user._id, reason);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
