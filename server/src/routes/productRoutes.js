// routes/productHomeRoutes.js
const express = require("express");
const ctrl = require("../controllers/productHomeController");
const ctrldetail = require("../controllers/productController");
const filterCtrl = require("../controllers/productFilterController");
const router = express.Router();

// Endpoint tổng hợp cho trang chủ
router.get("/home", ctrl.homeSections);

// --- ADD THIS NEW ROUTE FOR ALL PRODUCTS ---
router.get("/", ctrldetail.getAllPaginated);
router.get("/filters", filterCtrl.getFilterOptions);

// Endpoint tách riêng (nếu UI muốn gọi riêng)
// router.get("/newest", ctrl.newest);
// router.get("/best-sellers", ctrl.bestSellers);
// router.get("/most-viewed", ctrl.mostViewed);
// router.get("/top-discounts", ctrl.topDiscounts);

// Chi tiết sản phẩm theo slug
router.get("/:slug", ctrldetail.getBySlug);
module.exports = router;
