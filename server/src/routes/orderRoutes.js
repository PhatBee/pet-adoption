const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getListMyOrders, getMyOrder, cancelOrder } = require("../controllers/orderController")

// danh sách đơn của user
router.get("/my", authenticate, getListMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getMyOrder);

//Hủy đơn
router.put("/:orderId/cancel", authenticate, cancelOrder);

module.exports = router;