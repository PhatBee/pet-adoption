const express = require("express");
const { getMyOrders } = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/my-orders", authMiddleware, getMyOrders);

module.exports = router;
