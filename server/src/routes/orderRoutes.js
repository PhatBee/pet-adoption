const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/orders", authenticate, orderController.getOrders);       // xem lịch sử đơn hàng
router.get("/orders/:id", authenticate, orderController.getOrderDetail); // xem chi tiết đơn hàng

module.exports = router;