const express = require("express");
const {
  getLatestProducts,
  getBestSellers,
  getMostViewed,
  getTopDiscount,
  getProductById
} = require("../controllers/productController");

const router = express.Router();

router.get("/latest", getLatestProducts);
router.get("/best-sellers", getBestSellers);
router.get("/most-viewed", getMostViewed);
router.get("/discount", getTopDiscount);
router.get("/:id", getProductById);

module.exports = router;
