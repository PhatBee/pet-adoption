const express = require("express");
const router = express.Router();
const {authenticate} = require("../middleware/authMiddleware");
const { getListMyOrders, cancelOrder, getOrderDetail, getProductSnapshot,  vnpayReturn, vnpayIpn, momoReturn, momoIpn} = require("../controllers/orderController")
const {createOrUpdateReview} = require("../controllers/reviewController")

// 1. Route VNPAY Return (user's browser)
router.get("/vnpay_return", vnpayReturn);

// 2. Route VNPAY IPN (VNPAY's server)
router.get("/vnpay_ipn", vnpayIpn);

router.get("/momo_return", momoReturn); // GET cho redirect trình duyệt
router.post("/momo_ipn", momoIpn); // POST cho server MoMo gọi

// danh sách đơn của user
router.get("/my", authenticate, getListMyOrders);

// chi tiết đơn
router.get("/:id", authenticate, getOrderDetail);


// thêm review cho order
router.post("/:orderId/reviews", authenticate, createOrUpdateReview);

//Hủy đơn
router.patch("/:orderId/cancel-request", authenticate, cancelOrder);

// Snapshot
router.get("/:orderId/item/:productId/snapshot", authenticate, getProductSnapshot);


module.exports = router;