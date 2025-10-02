const { upsertReview, getReviewsByOrder } = require("../services/reviewService");
const Order = require("../models/Order");

async function createOrUpdateReview(req, res) {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;
    const { productId, rating, comment } = req.body;

    // 1) Kiểm tra order tồn tại & thuộc user & đã delivered
    const order = await Order.findOne({ _id: orderId, user: userId }).lean();
    if (!order) return res.status(404).json({ message: "Đơn hàng không tìm thấy" });
    if (order.status !== "delivered") return res.status(400).json({ message: "Chỉ được đánh giá khi đơn hàng đã giao thành công" });

    // 2) Kiểm tra product có trong order
    const found = order.items.find(it => it.product.toString() === productId.toString());
    if (!found) return res.status(400).json({ message: "Sản phẩm không thuộc đơn hàng này" });

    // 3) Rating hợp lệ
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ message: "Rating phải từ 1 đến 5" });

    const review = await upsertReview({ userId, productId, orderId, rating: r, comment: comment || "" });

    return res.json({ message: "Đã lưu đánh giá", review });
  } catch (err) {
    console.error(err);
    // nếu lỗi unique index upsert -> return meaningful message
    if (err.code === 11000) return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này" });
    return res.status(500).json({ message: "Lỗi khi lưu đánh giá" });
  }
}

// optional: edit review by reviewId (but simpler: use upsert route above)
module.exports = { createOrUpdateReview };
