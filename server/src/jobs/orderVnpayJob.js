const cron = require('node-cron');
const Order = require('../models/Order');
const { cancelPendingOrderAndRestoreStock } = require('../services/orderService');
const notificationService = require('../services/notificationService'); // 1. Import service

console.log('🕒 Cron job for pending VNPAY orders is scheduled.');

// Chạy tác vụ mỗi 5 phút
cron.schedule('*/5 * * * *', async () => {
  console.log('Running cron job: Cleaning up expired VNPAY orders...');
  
  try {
    const expiredOrders = await Order.find({
      status: 'pending',
      paymentMethod: 'VNPAY',
      expiresAt: { $lt: new Date() } // Tìm các đơn hàng đã quá hạn
    });

    if (expiredOrders.length === 0) {
      console.log('No expired VNPAY orders found.');
      return;
    }

    console.log(`Found ${expiredOrders.length} expired orders. Cancelling...`);

    // Hủy từng đơn hàng và hoàn kho
    for (const order of expiredOrders) {
      await cancelPendingOrderAndRestoreStock(order, 'Đơn hàng VNPAY tự động hủy do hết hạn thanh toán');

      // --- 2. GỬI THÔNG BÁO HỦY TỰ ĐỘNG ---
      // Gửi sau khi cancelPendingOrderAndRestoreStock đã chạy xong
      await notificationService.createAndSendNotification(
        order.user,
        {
          title: 'Đơn hàng VNPAY đã bị hủy',
          message: `Đơn hàng #${order._id.toString().slice(-6)} đã bị hủy tự động do quá hạn thanh toán VNPAY.`,
          link: `/orders/${order._id}`
        }
      );
    }

  } catch (error) {
    console.error('Error during scheduled VNPAY order cancellation:', error);
  }
});