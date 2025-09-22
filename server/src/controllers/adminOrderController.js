const Order = require("../models/Order");
const { changeOrderStatus } = require("../services/admin/adminOrderService");

// GET /api/admin/orders?page=&limit=
async function listOrders(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments()
    ]);

    res.json({ success: true, data: orders, meta: { page, limit, total } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err });
  }
}

async function getOrder(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate("items.product").lean();
    if (!order) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || err });
  }
}

// PATCH /api/admin/orders/:id/status  { status: "preparing", reason: "..." }
async function updateOrderStatus(req, res) {
  try {
    const adminId = req.user._id;
    const toStatus = req.body.status;
    const reason = req.body.reason || "";

    const updated = await changeOrderStatus(req.params.id, toStatus, adminId, "admin", reason);

    // optional: emit socket event to inform user/shop
    if (req.app.get("io") && updated.user) {
      req.app.get("io").to(`user:${updated.user.toString()}`).emit("order:update", { orderId: updated._id, status: updated.status });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ success: false, message: err.message || err });
  }
}

module.exports = { listOrders, getOrder, updateOrderStatus };