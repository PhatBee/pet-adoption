const Review = require("../models/Review");

// tạo hoặc cập nhật review (upsert)
async function upsertReview({ userId, productId, orderId, rating, comment }) {
  // tìm xem review của user cho product trong order đã tồn tại?
  const doc = await Review.findOneAndUpdate(
    { user: userId, product: productId, order: orderId },
    { rating, comment },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc;
}

async function getReviewsByOrder(orderId) {
  return Review.find({ order: orderId }).lean();
}

module.exports = { upsertReview, getReviewsByOrder };
