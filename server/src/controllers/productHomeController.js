const {
  getNewestProducts,
  getMostViewedProducts,
  getTopDiscountProducts,
  getBestSellers,
} = require("../services/productService");

const { Pet } = require('../models/Product');


function toLimit(q, def, max) {
  const n = parseInt(q?.limit, 10);
  if (Number.isNaN(n) || n <= 0) return def;
  return Math.min(n, max);
}

// 1) endpoint riêng lẻ cho từng mục
const newest = async (req, res) => {
  try {
    const limit = toLimit(req.query, 8, 50);
    const data = await getNewestProducts(limit);
    res.json({ items: data });
  } catch (e) {
    res.status(500).json({ message: "Lỗi lấy sản phẩm mới nhất" });
  }
};

const mostViewed = async (req, res) => {
  try {
    const limit = toLimit(req.query, 8, 50);
    const data = await getMostViewedProducts(limit);
    res.json({ items: data });
  } catch {
    res.status(500).json({ message: "Lỗi lấy sản phẩm xem nhiều" });
  }
};

const topDiscounts = async (req, res) => {
  try {
    const limit = toLimit(req.query, 4, 50);
    const data = await getTopDiscountProducts(limit);
    res.json({ items: data });
  } catch {
    res.status(500).json({ message: "Lỗi lấy sản phẩm khuyến mãi" });
  }
};

const bestSellers = async (req, res) => {
  try {
    const limit = toLimit(req.query, 6, 50);
    // chọn nguồn dữ liệu: 'auto' | 'counter' | 'orders' (tuỳ bạn)
    const mode = req.query.mode === "counter" || req.query.mode === "orders" ? req.query.mode : "auto";
    const data = await getBestSellers(limit, mode);
    res.json({ items: data });
  } catch {
    res.status(500).json({ message: "Lỗi lấy sản phẩm bán chạy" });
  }
};

// 2) endpoint tổng hợp cho trang chủ (gọi song song)
const homeSections = async (req, res) => {
  try {
    // Tìm ID của các loại thú cưng chính
    const dog = await Pet.findOne({ name: 'Dogs' }).lean(); // .lean() để tăng tốc độ
    const cat = await Pet.findOne({ name: 'Cats' }).lean();
    const bird = await Pet.findOne({ name: 'Birds' }).lean();


    // Lấy sản phẩm mới cho từng loại (nếu chúng tồn tại)
    const [newestForDog, newestForCat, newestForBird] = await Promise.all([
      dog ? getNewestProducts(8, dog._id) : Promise.resolve([]),
      cat ? getNewestProducts(8, cat._id) : Promise.resolve([]),
      bird ? getNewestProducts(8, bird._id) : Promise.resolve([]),
    ]);


    // 3. Tạo cấu trúc dữ liệu mới để trả về
    const sections = [];
    if (dog && newestForDog.length > 0) {
      sections.push({
        title: "Sản phẩm mới cho Chó",
        pet: dog,
        products: newestForDog,
      });
    }
    if (cat && newestForCat.length > 0) {
      sections.push({
        title: "Sản phẩm mới cho Mèo",
        pet: cat,
        products: newestForCat,
      });
    }
    if (bird && newestForBird.length > 0) {
      sections.push({
        title: "Sản phẩm mới cho Chim",
        pet: bird,
        products: newestForBird,
      });
    }

     res.json({ sections });


    // const [newest, best, viewed, discounts] = await Promise.all([
    //   getNewestProducts(8),
    //   getBestSellers(6, "auto"),
    //   getMostViewedProducts(8),
    //   getTopDiscountProducts(4),
    // ]);

    // res.json({
    //   newest,        // 08
    //   bestSellers: best,   // 06
    //   mostViewed: viewed,  // 08
    //   topDiscounts: discounts, // 04
    // });
  } catch (e) {
    console.error("Lỗi lấy dữ liệu trang chủ:", e);
    res.status(500).json({ message: "Lỗi lấy dữ liệu trang chủ" })
  }
};

module.exports = {
  // newest,
  // mostViewed,
  // topDiscounts,
  // bestSellers,
  homeSections,
};
