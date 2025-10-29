const cron = require('node-cron');
const Order = require('../models/Order');
const { cancelPendingOrderAndRestoreStock } = require('../services/orderService');
const notificationService = require('../services/notificationService'); // 1. Import service

console.log('🕒 Cron job for pending MoMo orders is scheduled.');

// Chạy tác vụ mỗi 5 phút
cron.schedule('*/5 * * * *', async () => {
  console.log('Running cron job: Cleaning up expired MoMo orders...');
  
  try {
    const now = new Date();
    // MoMo thường hết hạn nhanh hơn, ví dụ 10 phút thay vì 15
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const expiredOrders = await Order.find({
      status: 'pending',
      paymentMethod: 'MOMO',
      orderedAt: { $lt: tenMinutesAgo } // Kiểm tra thời gian tạo đơn hàng
      // Hoặc nếu bạn muốn thêm `expiresAt` cho MoMo:
      // expiresAt: { $lt: now } 
    });

    if (expiredOrders.length === 0) {
      console.log('No expired MoMo orders found.');
      return;
    }

    console.log(`Found ${expiredOrders.length} expired MoMo orders. Cancelling...`);

    for (const order of expiredOrders) {
      await cancelPendingOrderAndRestoreStock(order, 'Đơn hàng MoMo tự động hủy do hết hạn thanh toán');

      // --- 2. GỬI THÔNG BÁO HỦY TỰ ĐỘNG ---
      // Gửi sau khi cancelPendingOrderAndRestoreStock đã chạy xong
      await notificationService.createAndSendNotification(
        order.user,
        {
          title: 'Đơn hàng MoMo đã bị hủy',
          message: `Đơn hàng #${order._id.toString().slice(-6)} đã bị hủy tự động do quá hạn thanh toán MoMo.`,
          link: `/orders/${order._id}`
        }
      );
      // ------------------------------------
    }

  } catch (error) {
    console.error('Error during scheduled MoMo order cancellation:', error);
  }
});