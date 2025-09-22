const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getMyOrders, getMyOrder, cancelOrder } = require("../controllers/orderController")

// danh sách đơn của user
router.get("/my", authenticate, getMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getMyOrder);

//Hủy đơn
router.put("/:orderId/cancel", authenticate, cancelOrder);

module.exports = router;