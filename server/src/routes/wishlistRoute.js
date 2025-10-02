const express = require ("express");
const { addWishlist, removeWishlist, getWishlist } = require("../controllers/wishlistController.js");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticate, addWishlist);
router.delete("/:productId", authenticate, removeWishlist);
router.get("/", authenticate, getWishlist);

module.exports = router;
