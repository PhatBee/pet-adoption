require("dotenv").config();
const autoConfirmQueue = require("../queues/autoConfirmQueue");
const Order = require("../models/Order");
const { changeStatus } = require("../services/orderService"); 

// Xử lý job
autoConfirmQueue.process(async (job) => {
  const { orderId } = job.data;
  console.log("🔄 Processing job:", orderId);

  const order = await Order.findById(orderId);
  if (!order) {
    console.log("❌ Order not found:", orderId);
    return;
  }

  if (order.status !== "new") {
    console.log("⏩ Order not pending, skip:", order.status);
    return;
  }

  try {
    await changeStatus(orderId, "confirmed", null, "system", "Auto-confirm after 30 minutes");
    console.log("✅ Order auto-confirmed:", orderId);
  } catch (err) {
    console.error("⚠️ Failed to auto-confirm:", orderId, err);
    throw err; // để Bull tự retry
  }
});

// Optional event listeners
autoConfirmQueue.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});
autoConfirmQueue.on("failed", (job, err) => {
  console.error(`💥 Job ${job.id} failed`, err);
});