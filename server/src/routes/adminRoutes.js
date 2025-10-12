const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const { listOrders, getOrder, updateOrderStatus } = require("../controllers/adminOrderController");

// router.use(isAdmin);

//Quản lý đơn hàng
router.get("/orders", authenticate, isAdmin, listOrders);
router.get("/orders/:id", authenticate, isAdmin, getOrder);
router.patch("/orders/:id/status", authenticate, isAdmin, updateOrderStatus);

module.exports = router;