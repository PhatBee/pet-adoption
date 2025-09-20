const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getMyOrders, getOrderDetails, cancelOrder, changeOrderStatus } = require("../controllers/orderController")

// danh sách đơn của user
router.get("/my-orders", authenticate, getMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getOrderDetails);

// user hủy
router.post("/:id/cancel", authenticate, cancelOrder);

//cập nhật trạng thái
router.patch("/:id/status", authenticate, changeOrderStatus);


module.exports = router;