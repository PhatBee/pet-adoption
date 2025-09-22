const orderService = require("../services/orderService");
const Order = require("../models/Order");

async function getMyOrders(req, res) {
  try {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const data = await orderService.fetchUserOrders(userId, page, limit);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi lấy lịch sử mua hàng" });
  }
}


async function getMyOrder(req, res) {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const order = await orderService.getUserOrderById(userId, orderId);

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
  }
}

async function cancelOrder(red, req) {
  try {
    const { orderId } = req.params.id;
    const userId = req.user._id; 

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    // Kiểm tra đơn có thuộc về user không
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền hủy đơn này" });
    }

    const now = new Date();

    // Nếu còn trong thời hạn hủy (30 phút sau khi đặt)
    if (now <= order.cancellableUntil && 
       ["pending", "confirmed"].includes(order.status)) {
      order.status = "cancelled";
      order.orderStatusHistory.push({ status: "cancelled", changedAt: now });

      await order.save();
      return res.json({ message: "Hủy đơn thành công", order });
    }

    // Nếu đã quá hạn hoặc đơn đang chuẩn bị/giao
    if (["preparing", "shipping"].includes(order.status)) {
      order.status = "cancel_requested";
      order.orderStatusHistory.push({ status: "cancel_requested", changedAt: now });

      await order.save();
      return res.json({ message: "Đang xem xét yêu cầu hủy đơn", order });
    }

    // Nếu đơn đã giao hoặc đã hủy thì không cho hủy
    return res.status(400).json({ message: "Không thể hủy đơn" });

  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
}

module.exports = { getMyOrder, getMyOrders, cancelOrder };