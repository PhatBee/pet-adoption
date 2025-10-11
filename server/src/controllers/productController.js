// controllers/productController.js (ví dụ)
const mongoose = require("mongoose");
const {Product} = require("../models/Product");
const reviewService = require('../services/reviewService');

const getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

  // 2. Dùng .populate() để lấy thông tin chi tiết của pet và category
  const product = await Product.findOne({ slug, isActive: true })
      .populate('pet', 'name')
      .populate('category', 'name');
  
  if (!product) return res.status(404).json({ message: "Không tìm thấy" });

  // 3. Lấy tất cả review của sản phẩm này
  const reviews = await reviewService.getReviewsByProduct(product._id);

  // 4. Tính toán rating trung bình và tổng số review
    let averageRating = 0;
    let reviewCount = reviews.length;
    if (reviewCount > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviewCount;
    }

  // 5. Gửi về một object chứa tất cả dữ liệu cần thiết
    res.json({
      product: product,
      reviews: reviews,
      reviewStats: {
        average: averageRating.toFixed(1), // Làm tròn đến 1 chữ số thập phân
        count: reviewCount,
      }
    });

  // tăng viewCount “fire-and-forget”
    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => {});

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
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

const getAllPaginated = async (req, res) => {
  try {
    // Lấy page và limit từ query params, với giá trị mặc định
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await productService.getAllProducts({ page, limit });
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm phân trang:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getBySlug, getProductById, getAllPaginated };
