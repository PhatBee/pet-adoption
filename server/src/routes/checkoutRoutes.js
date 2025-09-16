const express = require("express");
const { getCheckoutCart, placeOrder } = require("../controllers/cartController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authenticate, getCheckoutCart);
router.post("/order", authenticate, placeOrder);

module.exports = router;