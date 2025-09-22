const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/isAdmin");
const { listOrders, getOrder, updateOrderStatus } = require("../controllers/adminOrderController");

// router.use(isAdmin);

//Quản lý đơn hàng
router.get("/", authenticate, isAdmin, listOrders);
router.get("/:id", authenticate, isAdmin, getOrder);
router.patch("/:id/status", authenticate, isAdmin, updateOrderStatus); 

module.exports = router;