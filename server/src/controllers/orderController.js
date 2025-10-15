const orderService = require("../services/orderService");
const Order = require("../models/Order");
const Review = require("../models/Review")

async function getListMyOrders(req, res) {
  try {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const status = req.query.status || null; // Lấy status từ query params

    const data = await orderService.fetchUserOrders(userId, page, limit, status);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi khi lấy lịch sử mua hàng" });
  }
}


// async function getMyOrder(req, res) {
//   try {
//     const userId = req.user.id;
//     const orderId = req.params.id;
//     const order = await orderService.getUserOrderById(userId, orderId);

//     if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

//     return res.json({ order });
//   } catch (err) {
//     return res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
//   }
// }

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

// GET /api/orders/:id  -> chi tiết order (chỉ owner)
async function getOrderDetail(req, res) {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

    // Lấy reviews liên quan đến order (nếu có)
    const reviews = await Review.find({ order: orderId, user: userId }).lean();

    // map reviews theo productId để frontend dễ dùng
    const reviewMap = {};
    for (const r of reviews) reviewMap[r.product.toString()] = r;

    return res.json({ order, reviews: reviewMap });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn" });
  }
}

async function getProductSnapshot(req, res) {
   try {
    const { orderId, productId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find(
      (i) => i.product.toString() === productId.toString()
    );

    if (!item) return res.status(404).json({ message: "Product not found in order" });

    // snapshot lưu trong order
    return res.json({ snapshot: item.productSnapshot, currentProductId: item.product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { getListMyOrders, cancelOrder, getOrderDetail, getProductSnapshot};