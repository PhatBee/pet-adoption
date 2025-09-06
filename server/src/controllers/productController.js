const mongoose = require("mongoose");
const Product = require("../models/Product");

// 08 sản phẩm mới nhất
exports.getLatestProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(8);
  res.json(products);
};

// 06 sản phẩm bán chạy
exports.getBestSellers = async (req, res) => {
  const products = await Product.find().sort({ sold: -1 }).limit(6);
  res.json(products);
};

// 08 sản phẩm xem nhiều
exports.getMostViewed = async (req, res) => {
  const products = await Product.find().sort({ views: -1 }).limit(8);
  res.json(products);
};

// 04 sản phẩm khuyến mãi cao nhất
exports.getTopDiscount = async (req, res) => {
  const products = await Product.find().sort({ discount: -1 }).limit(4);
  res.json(products);
};

// Chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  // Kiểm tra id có hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};
