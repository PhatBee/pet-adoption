const express = require("express");
const { getCart, addToCart, updateCartItem, clearCart, removeCartItem } = require("../controllers/cartController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Lấy giỏ hàng
router.get("/", authenticate, getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authenticate, addToCart);

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/update", authenticate, updateCartItem);

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove/:productId", authenticate, removeCartItem);

// Xóa toàn bộ giỏ hàng
router.delete("/clear", authenticate, clearCart);

module.exports = router;