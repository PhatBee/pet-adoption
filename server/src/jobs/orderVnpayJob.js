const cron = require('node-cron');
const Order = require('../models/Order');
const { cancelPendingOrderAndRestoreStock } = require('../services/orderService');

console.log('🕒 Cron job for pending orders is scheduled.');

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
      console.log('No expired orders found.');
      return;
    }

    console.log(`Found ${expiredOrders.length} expired orders. Cancelling...`);

    // Hủy từng đơn hàng và hoàn kho
    for (const order of expiredOrders) {
      await cancelPendingOrderAndRestoreStock(order, 'Đơn hàng VNPAY tự động hủy do hết hạn thanh toán');
    }

  } catch (error) {
    console.error('Error during scheduled order cancellation:', error);
  }
});