  const orderService = require("../services/orderService");
  const Order = require("../models/Order");
  const Review = require("../models/Review")
  const User = require("../models/User");
  const mongoose = require("mongoose");
  const querystring = require('qs');
  const { processIpn, processReturnUrl } = require("../services/vnpayService");

  async function getListMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const status = req.query.status || null; // Lấy status từ query params

      const data = await orderService.fetchUserOrders(userId, page, limit, status);
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: "Lỗi khi lấy lịch sử mua hàng" });
    }
  }


  // async function getMyOrder(req, res) {
  //   try {
  //     const userId = req.user.id;
  //     const orderId = req.params.id;
  //     const order = await orderService.getUserOrderById(userId, orderId);

  //     if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

  //     return res.json({ order });
  //   } catch (err) {
  //     return res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn hàng" });
  //   }
  // }

  async function cancelOrder(req, res) {
    const session = await mongoose.startSession();
    try {
      const userId = req.user.id;
      const orderId = req.params.orderId;

      session.startTransaction();


      const order = await Order.findOne({ _id: orderId, user: userId });
      if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

      // Kiểm tra đơn có thuộc về user không
      if (order.user.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Bạn không có quyền hủy đơn này" });
      }

      const now = new Date();

      const total = order.itemsTotal ?? 0;
      
      // Hàm tính số xu cần trừ (15% của tổng tiền)
      const deduction = Math.round(0.15 * total);

      // Nếu còn trong thời hạn hủy (30 phút sau khi đặt)
      if (now <= order.cancellableUntil && 
        ["pending", "confirmed"].includes(order.status)) {
        order.status = "cancelled";
        order.orderStatusHistory.push({ status: "cancelled", changedAt: now });

        // Cập nhật loyaltyPoints của user - chỉ khi hủy thành công
      const user = await User.findById(userId).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      // Trừ loyaltyPoints, không cho âm
      const currentPoints = user.loyaltyPoints ?? 0;
      const newPoints = Math.max(0, currentPoints - deduction);
      user.loyaltyPoints = newPoints;

      // Lưu cả order và user trong transaction
      await order.save({ session });
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return res.json({
        message: "Hủy đơn thành công",
        order
      });
      }

      // Nếu đã quá hạn hoặc đơn đang chuẩn bị/giao
      if (["confirmed", "preparing", "shipping"].includes(order.status)) {
        order.status = "cancel_requested";
        order.orderStatusHistory.push({ status: "cancel_requested", changedAt: now });
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();
        return res.json({ message: "Đã gửi yêu cầu hủy đơn.", order });
      }

      // Nếu đơn đã giao hoặc đã hủy thì không cho hủy
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Không thể hủy đơn" });

    } catch (error) {
      try { await session.abortTransaction(); } catch (_) {}
      session.endSession();
      console.error("Cancel Order Error:", error);
      res.status(500).json({ message: "Lỗi server", error });
    }
  }

  // GET /api/orders/:id  -> chi tiết order (chỉ owner)
  async function getOrderDetail(req, res) {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;

      const order = await Order.findOne({ _id: orderId, user: userId }).lean();
      if (!order) return res.status(404).json({ message: "Đơn hàng không tồn tại" });

      // Lấy reviews liên quan đến order (nếu có)
      const reviews = await Review.find({ order: orderId, user: userId }).lean();

      // map reviews theo productId để frontend dễ dùng
      const reviewMap = {};
      for (const r of reviews) reviewMap[r.product.toString()] = r;

      return res.json({ order, reviews: reviewMap });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi khi lấy chi tiết đơn" });
    }
  }

  async function getProductSnapshot(req, res) {
    try {
      const { orderId, productId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) return res.status(404).json({ message: "Order not found" });

      const item = order.items.find(
        (i) => i.product.toString() === productId.toString()
      );

      if (!item) return res.status(404).json({ message: "Product not found in order" });

      // snapshot lưu trong order
      return res.json({ snapshot: item.productSnapshot, currentProductId: item.product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /**
 * Xử lý VNPAY Return
 * Trình duyệt của user được VNPAY redirect về đây
 */
const vnpayReturn = (req, res) => {
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

    try {
        console.log("VNPAY Return Query:", req.query);
        const { isValid, params } = processReturnUrl(req.query);

        console.log("VNPAY Return Params:", params);


        // Tạo query string để gửi về frontend
        const queryString = querystring.stringify(params);
        console.log("VNPAY Return Query String:", queryString);

        if (isValid) {
            // Chuyển hướng về trang kết quả của React
            res.redirect(`${CLIENT_URL}/payment/result?${queryString}`);
        } else {
            // Chuyển hướng về trang kết quả với mã lỗi
            res.redirect(`${CLIENT_URL}/payment/result?vnp_ResponseCode=97`);
        }
    } catch (error) {
        console.error("Lỗi VNPAY Return:", error);
        res.redirect(`${CLIENT_URL}/payment/result?vnp_ResponseCode=99`);
    }
};

/**
 * Xử lý VNPAY IPN
 * Server VNPAY gọi về đây (server-to-server)
 */
const vnpayIpn = async (req, res) => {
    try {
        const result = await processIpn(req.query);
        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi VNPAY IPN:", error);
        res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

module.exports = { getListMyOrders, cancelOrder, getOrderDetail, getProductSnapshot, vnpayReturn, vnpayIpn };