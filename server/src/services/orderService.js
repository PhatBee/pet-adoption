const mongoose = require("mongoose");
const Order = require("../models/Order");
const OrderHistory = require("../models/OrderStatusHistory");

const ALLOWED = {
  pending: ["confirmed","cancelled"],
  confirmed: ["preparing","cancelled"],
  preparing: ["shipping","cancel_requested"],
  cancel_requested: ["cancelled","preparing"], // shop decide
  shipping: ["delivered"],
  delivered: [],
  cancelled: []
};

function isAllowedTransition(from, to) {
  if (!ALLOWED[from]) return false;
  return ALLOWED[from].includes(to);
}

async function changeStatus(orderId, toStatus, actorId = null, actorRole = "system", reason = "") {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Đơn hàng không tồn tại");

    const fromStatus = order.status;
    if (fromStatus === toStatus) {
      // idempotent: tạo history optional
      await session.commitTransaction();
      session.endSession();
      return order;
    }

    if (!isAllowedTransition(fromStatus, toStatus)) {
      throw new Error(`Không thể đổi trạng thái từ ${fromStatus} sang ${toStatus}`);
    }

    // cập nhật timestamp tuỳ trạng thái
    const now = new Date();
    const updates = { status: toStatus };
    if (toStatus === "confirmed") updates.confirmedAt = now;
    if (toStatus === "preparing") updates.preparingAt = now;
    if (toStatus === "shipping") updates.shippedAt = now;
    if (toStatus === "delivered") updates.deliveredAt = now;
    if (toStatus === "cancelled") updates.cancelledAt = now;

    // apply updates
    Object.assign(order, updates);
    await order.save({ session });

    // history
    await OrderHistory.create([{
      order: order._id,
      fromStatus,
      toStatus,
      changedBy: actorId,
      actorRole,
      reason
    }], { session });

    // nếu bị hủy: gọi refund/restock (tách function, async)
    if (toStatus === "cancelled") {
      // await processRefund(order, session);
      // await restockItems(order.items, session);
    }

    await session.commitTransaction();
    session.endSession();
    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function cancelOrderByUser(orderId, userId, reason = "") {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Đơn hàng không tồn tại");
  if (order.user.toString() !== userId.toString()) throw new Error("Không thể hủy đơn");

  const now = new Date();
  const minutesSinceOrder = (now - order.orderedAt) / (1000 * 60);

  if (minutesSinceOrder <= 30 && ["pending","confirmed"].includes(order.status)) {
    return await changeStatus(orderId, "cancelled", userId, "user", reason || "Hủy đơn thành công");
  }

  if (order.status === "preparing") {
    // send cancel request
    return await changeStatus(orderId, "cancel_requested", userId, "user", reason || "Từ chối hủy đơn");
  }

  throw new Error("Không thể hủy đơn");
}

module.exports = { changeStatus, cancelOrderByUser };