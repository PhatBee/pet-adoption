// controllers/productController.js (ví dụ)
const Product = require("../models/Product");

const getBySlug = async (req, res) => {
  const { slug } = req.params;
  const product = await Product.findOne({ slug, isActive: true });
  if (!product) return res.status(404).json({ message: "Không tìm thấy" });
  res.json({ product });

  // tăng viewCount “fire-and-forget”
  Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});
};
module.exports = { getBySlug };