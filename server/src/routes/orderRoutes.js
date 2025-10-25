const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getListMyOrders, cancelOrder, getOrderDetail, getProductSnapshot, getReorderInfo } = require("../controllers/orderController");
const {createOrUpdateReview} = require("../controllers/reviewController");


// danh sách đơn của user
router.get("/my", authenticate, getListMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getOrderDetail);


// thêm review cho order
router.post("/:orderId/reviews", authenticate, createOrUpdateReview);

//Hủy đơn
router.patch("/:orderId/cancel-request", authenticate, cancelOrder);

//Đơn mua lại 
router.get("/:orderId/reorder-info", authenticate, getReorderInfo);

// Snapshot
router.get("/:orderId/item/:productId/snapshot", authenticate, getProductSnapshot);


module.exports = router;