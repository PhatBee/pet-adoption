// controllers/productController.js (ví dụ)
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");

const getBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) return res.status(404).json({ message: "Không tìm thấy" });
  res.json({ product });

  // tăng viewCount “fire-and-forget”
  Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});
};

// Chi tiết sản phẩm
const getProductById = async (req, res) => {
  const { id } = req.params;

  // Kiểm tra id có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// GET /api/orders/:id  -> chi tiết order (chỉ owner)
async function getOrderDetail(req, res) {
  try {
    const userId = req.user._id;
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

module.exports = { getBySlug, getProductById, getOrderDetail };
