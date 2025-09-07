const express = require("express");
const { getMyOrders } = require("../controllers/orderController");
const {authenticate} = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/my-orders", authenticate, getMyOrders);

module.exports = router;
