const Order = require("../models/Order");
const { changeOrderStatus } = require("../services/admin/adminOrderService");

// GET /api/admin/orders?page=&limit=
async function listOrders(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, parseInt(req.query.limit || "20", 10));
    const skip = (page - 1) * limit;

    const { q, status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { "shippingAddress.fullName": { $regex: q, $options: "i" } },
        { "shippingAddress.phone": { $regex: q, $options: "i" } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
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
    const { id } = req.params;
    const { status } = req.body;
    
    const allowedStatuses = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipping", "cancelled"],
      preparing: ["shipping", "cancelled"],
      shipping: ["delivered", "cancelled"],
      delivered: ["refunded"],
      cancel_requested: ["cancelled", "preparing"],
      cancelled: [],
      refunded: [],
    };

    const order = await Order.findById(id);
    const currentStatus = order.status;
    const nextAllowed = allowedStatuses[currentStatus] || [];

    if (!nextAllowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Không thể chuyển từ ${currentStatus} sang ${status}` });
    }
    if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

    order.status = status;
    order.orderStatusHistory.push({
      status,
      changedAt: new Date()
    });

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: err.message || "Lỗi server" });
  }
}

async function approveCancelRequest (req, res) {
  try {
    const order = await changeOrderStatus(
      req.params.id,
      "cancelled",
      req.user._id,
      "admin"
    );
    res.json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

async function rejectCancelRequest (req, res) {
  try {
    const order = await changeOrderStatus(
      req.params.id,
      "confirmed",
      req.user._id,
      "admin"
    );
    res.json(order);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { listOrders, getOrder, updateOrderStatus , approveCancelRequest, rejectCancelRequest };