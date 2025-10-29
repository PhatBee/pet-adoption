const mongoose = require("mongoose");
const Order = require("../models/Order");
const {Product} = require("../models/Product");
const User = require("../models/User");

/**
 * Lấy danh sách đơn hàng của user theo pagination (page-based)
 * @param {ObjectId} userId
 * @param {Number} page
 * @param {Number} limit
 * @returns {Object} { items, total, page, limit }
 */
async function fetchUserOrders(userId, page = 1, limit = 10, status = null) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  // 1. Tạo đối tượng điều kiện truy vấn
  const queryConditions = { user: userId };
  // Nếu có status được truyền vào, thêm nó vào điều kiện
  if (status) {
    queryConditions.status = status;
  }

  // 2. Lấy tổng & items song song với điều kiện đã lọc
  const [total, items] = await Promise.all([
    Order.countDocuments(queryConditions), // Dùng queryConditions ở đây
    Order.find(queryConditions) // Dùng queryConditions ở đây
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .lean()
  ]);

  return { items, total, page: p, limit: l };

  // return await Order.find({ userId }).sort({ createdAt: -1 });
}

async function restockItems(items, session) {
  for (const it of items) {
    await Product.updateOne(
      { _id: it.product },
      { $inc: { stock: Number(it.quantity) } },
      { session }
    );
  }
}

async function getUserOrderById(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId }).lean();
  return order;
}

async function updateOrderStatus(orderId, newStatus) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");

  order.status = newStatus;

  order.orderStatusHistory.push({
    status: newStatus,
    changedAt: new Date()
  });

  await order.save();
  return order;
}

async function cancelOrder(orderId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOne({ _id: orderId, user: userId }).session(session);
    if (!order) throw { status: 404, message: "Đơn hàng không tồn tại" };

    if (["cancelled", "refunded"].includes(order.status)) {
      throw { status: 400, message: "Đơn hàng này đã bị hủy" };
    }

    const now = new Date();
    if (order.cancellableUntil && now > order.cancellableUntil) {
      throw { status: 400, message: "Bạn chỉ có thể hủy đơn trong 30 phút đầu sau khi đặt." };
    }

    if (now <= order.cancellableUntil && order.status === "pending") {
      order.status = "cancelled";
      order.orderStatusHistory.push({
        status: "cancelled",
        changedAt: now,
        actorRole: "user"
      });
      await restockItems(order.items, session);
    }
    else if (["preparing"].includes(order.status)) {
      order.status = "cancel_requested";
      order.orderStatusHistory.push({
        status: "cancel_requested",
        changedAt: now,
        actorRole: "user"
      });
    }
    else {
      throw { status: 400, message: "Không thể hủy đơn ở trạng thái hiện tại." };
    }

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function getReorderInfo (orderId) {
  
  const order = await Order.findById(orderId); // Không cần populate ở đây
  if (!order) throw new Error("Không tìm thấy đơn hàng.");

  const available = [];
  const unavailable = [];

  for (const item of order.items) {
// Tìm sản phẩm hiện tại trong DB
    // (item.product là ID)
    const product = await Product.findById(item.product);

    let reason = "";    
    // BẮT ĐẦU LOGIC KIỂM TRA MỚI
    if (!product) {
      reason = "Sản phẩm đã bị xoá";
    } else if (!product.isActive) {
      reason = "Sản phẩm đã ngừng kinh doanh";
    } else if (product.stock < item.quantity) { 
      // === THAY ĐỔI QUAN TRỌNG ===
      // So sánh kho thực tế với số lượng trong đơn hàng
      reason = `Không đủ số lượng (cần ${item.quantity}, còn ${product.stock})`;
    }
    // KẾT THÚC LOGIC KIỂM TRA MỚI

     if (reason) {
      unavailable.push({
        name: item.productSnapshot.name, // Lấy tên từ snapshot cho an toàn
        quantity: item.quantity,
        reason: reason
      });
    } else {
      // === THAY ĐỔI QUAN TRỌNG ===
      // Trả về cấu trúc mà CheckoutPage.jsx mong đợi
      // { product: { ... }, quantity: ... }
      available.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock // Gửi luôn stock để tham khảo
        },
        quantity: item.quantity
      });
    }
  }

   return { available, unavailable };
};

module.exports = { getUserOrderById, fetchUserOrders, updateOrderStatus, cancelOrder, restockItems, getReorderInfo };
// Cancel Order For Vnpay
/**
 * Hủy một đơn hàng và hoàn trả lại số lượng tồn kho.
 * Chỉ nên gọi hàm này cho các đơn hàng CHƯA được thanh toán (pending)
 * @param {object} order - Toàn bộ đối tượng Order (từ Mongoose)
 * @param {string} reason - Lý do hủy đơn
 */
const cancelPendingOrderAndRestoreStock = async (order, reason) => {
  if (order.status !== 'pending') {
    console.warn(`Attempted to cancel an already processed order: ${order._id}`);
    return;
  }

  // Bắt đầu một transaction để đảm bảo an toàn
  const session = await Order.startSession();
  session.startTransaction();

  try {
    // 1. Cập nhật trạng thái đơn hàng
    order.status = 'cancelled';
    order.orderStatusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      reason: reason
    });
    await order.save({ session });

    // 2. Hoàn trả lại stock cho từng sản phẩm
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product }, // Dùng item.product (là _id)
        { 
          $inc: { 
            stock: item.quantity,    // Cộng trả lại stock
            soldCount: -item.quantity // Trừ đi số lượng đã bán
          } 
        },
        { session }
      );
    }

    // 3. Xử lý bù lại điểm tích lũy đã cộng
    // Lấy tổng tiền từ các tên field phổ biến
    const total = order.itemsTotal ?? 0;
    const loyaltyDeducted = Math.round(total * 0.10); // 10%, làm tròn

    // Lấy user và cập nhật loyaltyPoints
    const userId = order.user && order.user._id ? order.user._id : order.user;
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error(`Người dùng ${userId} không tồn tại`);
    }

    const currentPoints = user.loyaltyPoints ?? 0;
    const newPoints = Math.max(0, currentPoints - loyaltyDeducted);
    user.loyaltyPoints = newPoints;

    await user.save({ session });


    // 3. Commit transaction
    await session.commitTransaction();
  } catch (error) {
    // Nếu có lỗi, rollback tất cả
    await session.abortTransaction();
    console.error(`Failed to cancel and restore stock for order ${order._id}:`, error);
  } finally {
    session.endSession();
  }
};

module.exports = { getUserOrderById, fetchUserOrders, updateOrderStatus, cancelOrder, restockItems, cancelPendingOrderAndRestoreStock };