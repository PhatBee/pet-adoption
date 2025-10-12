// const express = require("express");
// const {
//   getLatestProducts,
//   getBestSellers,
//   getMostViewed,
//   getTopDiscount,
//   getProductById
// } = require("../controllers/productController");

// const router = express.Router();

// router.get("/latest", getLatestProducts);
// router.get("/best-sellers", getBestSellers);
// router.get("/most-viewed", getMostViewed);
// router.get("/discount", getTopDiscount);
// router.get("/:id", getProductById);

// module.exports = router;


// routes/productHomeRoutes.js
const express = require("express");
const ctrl = require("../controllers/productHomeController");
const ctrldetail = require("../controllers/productController");
const router = express.Router();

// Endpoint tổng hợp cho trang chủ
router.get("/home", ctrl.homeSections);

// --- ADD THIS NEW ROUTE FOR ALL PRODUCTS ---
router.get("/", ctrldetail.getAllPaginated);

// Endpoint tách riêng (nếu UI muốn gọi riêng)
// router.get("/newest", ctrl.newest);
// router.get("/best-sellers", ctrl.bestSellers);
// router.get("/most-viewed", ctrl.mostViewed);
// router.get("/top-discounts", ctrl.topDiscounts);

// Chi tiết sản phẩm theo slug
router.get("/:slug", ctrldetail.getBySlug);
module.exports = router;
