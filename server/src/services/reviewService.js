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

async function getReviewsByProduct(productId) {
  if (!productId) return [];
  
  // Tìm tất cả review của sản phẩm
  // .populate('user', 'name avatarUrl') để lấy tên và avatar của người đánh giá
  // .sort({ createdAt: -1 }) để hiển thị review mới nhất lên đầu
  return Review.find({ product: productId })
    .populate("user", "name avatarUrl") 
    .sort({ createdAt: -1 })
    .lean();
}

module.exports = { upsertReview, getReviewsByOrder, getReviewsByProduct };
