const express = require("express");
const { getCart, addToCart } = require("../controllers/cartController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// Lấy giỏ hàng
router.get("/", authenticate, getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authenticate, addToCart);

module.exports = router;