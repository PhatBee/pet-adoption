const orderService = require("../services/orderService");

async function getOrders(req, res) {
  try {
    const userId = req.user.id; // lấy từ JWT sau khi user đăng nhập
    const orders = await orderService.getUserOrders(userId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử mua hàng" });
  }
}


async function getOrderDetail(req, res) {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const order = await orderService.getOrderDetail(orderId, userId);

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
  }
}

module.exports = { getOrders, getOrderDetail };