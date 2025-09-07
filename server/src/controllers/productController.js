// controllers/productController.js (ví dụ)
const mongoose = require("mongoose");
const Product = require("../models/Product");

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

module.exports = { getBySlug, getProductById };
