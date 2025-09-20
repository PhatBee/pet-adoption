const cron = require("node-cron");
const Order = require("../models/Order");

// Job chạy mỗi phút để kiểm tra đơn hàng
cron.schedule("* * * * *", async () => {
  try {
    console.log("🔍 Cron job chạy kiểm tra đơn hàng...");

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    // Lấy các đơn PENDING
    const pendingOrders = await Order.find({ status: "pending" });

    for (let order of pendingOrders) {
      const orderedAt = order.orderedAt || order.createdAt; // ưu tiên orderedAt, fallback createdAt

      if (now - new Date(orderedAt) >= THIRTY_MINUTES) {
        order.status = "confirmed"; // ✅ đổi sang confirmed
        await order.save();

        console.log(`Đã xác nhận đơn hàng ${order._id}`);
      }
    }
  } catch (err) {
    console.error("❌ Lỗi cron job:", err);
  }
});
