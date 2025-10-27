const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getListMyOrders, cancelOrder, getOrderDetail, getProductSnapshot } = require("../controllers/orderController")
const {createOrUpdateReview} = require("../controllers/reviewController")

// danh sách đơn của user
router.get("/my", authenticate, getListMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getOrderDetail);

// 1. Route VNPAY Return (user's browser)
router.get("/vnpay_return", orderController.vnpayReturn);

// 2. Route VNPAY IPN (VNPAY's server)
router.get("/vnpay_ipn", orderController.vnpayIpn);


// thêm review cho order
router.post("/:orderId/reviews", authenticate, createOrUpdateReview);

//Hủy đơn
router.patch("/:orderId/cancel-request", authenticate, cancelOrder);

// Snapshot
router.get("/:orderId/item/:productId/snapshot", authenticate, getProductSnapshot);


module.exports = router;