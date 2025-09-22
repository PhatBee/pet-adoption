const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getOrders, getOrderDetail, cancelOrder } = require("../controllers/orderController")

// danh sách đơn của user
router.get("/my-orders", authenticate, getOrders);

// chi tiết đơn
router.get("/:id", authenticate, getOrderDetail);

//Hủy đơn
router.put("/:orderId/cancel", authenticate, cancelOrder);

module.exports = router;