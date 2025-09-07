// const Product = require("../models/Product");

// // 08 sản phẩm mới nhất
// exports.getLatestProducts = async (req, res) => {
//   const products = await Product.find().sort({ createdAt: -1 }).limit(8);
//   res.json(products);
// };

// // 06 sản phẩm bán chạy
// exports.getBestSellers = async (req, res) => {
//   const products = await Product.find().sort({ sold: -1 }).limit(6);
//   res.json(products);
// };

// // 08 sản phẩm xem nhiều
// exports.getMostViewed = async (req, res) => {
//   const products = await Product.find().sort({ views: -1 }).limit(8);
//   res.json(products);
// };

// // 04 sản phẩm khuyến mãi cao nhất
// exports.getTopDiscount = async (req, res) => {
//   const products = await Product.find().sort({ discount: -1 }).limit(4);
//   res.json(products);
// };

// // Chi tiết sản phẩm
// exports.getProductById = async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) return res.status(404).json({ message: "Product not found" });
//   res.json(product);
// };

// controllers/productHomeController.js
const {
  getNewestProducts,
  getMostViewedProducts,
  getTopDiscountProducts,
  getBestSellers,
} = require("../services/productService");

function toLimit(q, def, max) {
  const n = parseInt(q?.limit, 10);
  if (Number.isNaN(n) || n <= 0) return def;
  return Math.min(n, max);
}

// 1) endpoint riêng lẻ cho từng mục
const newest = async (req, res) => {
  try {
    const limit = toLimit(req.query, 8, 50);
    const data = await getNewestProducts(limit);
    res.json({ items: data });
  } catch (e) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm mới nhất" });
  }
};

const mostViewed = async (req, res) => {
  try {
    const limit = toLimit(req.query, 8, 50);
    const data = await getMostViewedProducts(limit);
    res.json({ items: data });
  } catch {
    res.status(500).json({ message: "Lỗi lấy sản phẩm xem nhiều" });
  }
};

const topDiscounts = async (req, res) => {
  try {
    const limit = toLimit(req.query, 4, 50);
    const data = await getTopDiscountProducts(limit);
    res.json({ items: data });
  } catch {
    res.status(500).json({ message: "Lỗi lấy sản phẩm khuyến mãi" });
  }
};

const bestSellers = async (req, res) => {
  try {
    const limit = toLimit(req.query, 6, 50);
    // chọn nguồn dữ liệu: 'auto' | 'counter' | 'orders' (tuỳ bạn)
    const mode = req.query.mode === "counter" || req.query.mode === "orders" ? req.query.mode : "auto";
    const data = await getBestSellers(limit, mode);
    res.json({ items: data });
  } catch {
    res.status(500).json({ message: "Lỗi lấy sản phẩm bán chạy" });
  }
};

// 2) endpoint tổng hợp cho trang chủ (gọi song song)
const homeSections = async (req, res) => {
  try {
    const [newest, best, viewed, discounts] = await Promise.all([
      getNewestProducts(8),
      getBestSellers(6, "auto"),
      getMostViewedProducts(8),
      getTopDiscountProducts(4),
    ]);

    res.json({
      newest,        // 08
      bestSellers: best,   // 06
      mostViewed: viewed,  // 08
      topDiscounts: discounts, // 04
    });
  } catch (e) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu trang chủ" });
  }
};

module.exports = {
  newest,
  mostViewed,
  topDiscounts,
  bestSellers,
  homeSections,
};
