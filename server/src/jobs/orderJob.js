const cron = require("node-cron");
const Order = require("../models/Order");
const notificationService = require('../services/notificationService'); // 1. Import service

// Job chạy mỗi phút để kiểm tra đơn hàng
cron.schedule("* * * * *", async () => {
  try {
    console.log("Cron job chạy kiểm tra đơn hàng...");

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    // Lấy các đơn PENDING
    const pendingOrders = await Order.find({ status: "pending" });

    for (let order of pendingOrders) {
      const orderedAt = order.orderedAt || order.createdAt; // ưu tiên orderedAt, fallback createdAt

      if (now - new Date(orderedAt) >= THIRTY_MINUTES) {
        order.status = "confirmed";
        order.orderStatusHistory.push({
          status: "confirmed",
          changedAt: new Date()
        });
        await order.save();
        let confirmedOrder = order;

        console.log(`Đã xác nhận đơn hàng ${order._id}`);

        // --- 2. GỬI THÔNG BÁO ---
        const statusLabel = translateOrderStatus(confirmedOrder.status);

        await notificationService.createAndSendNotification(
          order.user, // userId
          {
            title: 'Đơn hàng đã được xác nhận',
            message: `Đơn hàng #${order._id.toString().slice(-6)} của bạn đã được xác nhận và đang chờ xử lý. Trạng thái đơn hàng: ${statusLabel}`,
            link: `/orders/${order._id}`
          }
        );
        // -------------------------
      }
    }
  } catch (err) {
    console.error("Lỗi cron job:", err);
  }
});
