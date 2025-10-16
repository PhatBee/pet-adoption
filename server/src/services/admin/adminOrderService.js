const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const { isAllowedTransition } = require("../../utils/orderTransitions");

//restock
async function restockItems(items, session) {
  for (const it of items) {
    await Product.updateOne(
      { _id: it.product },
      { $inc: { stock: it.quantity * 1 * 1 } }, // +quantity
      { session }
    );
  }
}

async function changeOrderStatus(orderId, toStatus) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw { status: 404, message: "Order not found" };

    const fromStatus = order.status;
    if (fromStatus === toStatus) {
      // nothing to do
      await session.commitTransaction();
      session.endSession();
      return order;
    }

    if (!isAllowedTransition(fromStatus, toStatus)) {
      throw { status: 400, message: `Invalid transition: ${fromStatus} -> ${toStatus}` };
    }

    // Đơn bị hủy thì restock sản phẩm
    if (toStatus === "cancelled") {
      if (["pending", "confirmed", "preparing"].includes(fromStatus)) {
        await restockItems(order.items, session);
      }
      order.cancelledAt = new Date();
    }

    if (toStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    // update status + push history
    order.status = toStatus;
    order.orderStatusHistory = order.orderStatusHistory || [];
    order.orderStatusHistory.push({
      status: toStatus,
      changedAt: new Date()
    });

    // xóa autoConfirmJobId
    if (order.autoConfirmJobId && ["confirmed","cancelled"].includes(toStatus)) {
      order.autoConfirmJobId = null;
    }

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Optionally populate before return
    await order.populate("items.product").execPopulate?.(); // if mongoose <6 use execPopulate

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { restockItems, changeOrderStatus };
