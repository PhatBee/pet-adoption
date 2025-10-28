// controllers/productController.js (ví dụ)
const mongoose = require("mongoose");
const { Product } = require("../models/Product");
const reviewService = require('../services/reviewService');
const productService = require("../services/productService");

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

    const reviewStats = {
      average: averageRating.toFixed(1),
      count: reviewCount,
    };

    // --- 5. GỌI LẤY SẢN PHẨM LIÊN QUAN ---
    // Chạy song song 2 truy vấn
    const [relatedByCategory, relatedByPet] = await Promise.all([
      // Lấy 8 sản phẩm cùng thể loại, trừ sản phẩm hiện tại
      productService.getProductsByCategory(product.category._id, 8, product._id),
      
      // Lấy 8 sản phẩm mới nhất cùng loại thú cưng, trừ sản phẩm hiện tại
      productService.getNewestProducts(8, product.pet._id, product._id)
    ]);



    // 6. Gửi về một object chứa tất cả dữ liệu cần thiết
    res.json({
      product: product,
      reviews: reviews,
      reviewStats: reviewStats,
      relatedProducts: { // <-- Thêm object này
        byCategory: relatedByCategory,
        byPet: relatedByPet
      }
    });

    // tăng viewCount “fire-and-forget”
    Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).catch(() => { });

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

    const {
      page,
      limit,
      searchTerm,
      category,
      pet,
      minPrice,
      maxPrice,
      sortBy
    } = req.query;

    // 2. Gọi service và truyền vào một object chứa tất cả các tham số
    const result = await productService.getAllProducts({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 12,
      searchTerm,
      category,
      pet,
      minPrice,
      maxPrice,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm phân trang:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = { getBySlug, getProductById, getAllPaginated };
