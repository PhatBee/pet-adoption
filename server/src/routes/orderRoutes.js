const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getListMyOrders, cancelOrder, getOrderDetail, getProductSnapshot } = require("../controllers/orderController")
const {createOrUpdateReview} = require("../controllers/reviewController")

// danh sách đơn của user
router.get("/my", authenticate, getListMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getOrderDetail);


// thêm review cho order
router.post("/:orderId/reviews", authenticate, createOrUpdateReview);

//Hủy đơn
router.put("/:orderId/cancel", authenticate, cancelOrder);

// Snapshot
router.get("/:orderId/item/:productId/snapshot", authenticate, getProductSnapshot);


module.exports = router;