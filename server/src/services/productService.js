// services/productService.js
const {Product} = require("../models/Product");
const Order = require("../models/Order"); // nếu dùng aggregation

// Chỉ chọn các field an toàn cần cho trang chủ
const PUBLIC_FIELDS = [
  "name",
  "stock",
  "price",
  "compareAtPrice",
  "thumbnail",
  "images",
  "viewCount",
  "createdAt",
  "slug"
].join(" ");

function toLeanQuery(q) {
  return q.select(PUBLIC_FIELDS).lean({ virtuals: true });
}

// 1) Mới nhất
async function getNewestProducts(limit = 8, petId = null) {
  // Xây dựng điều kiện query cơ bản
  const queryConditions = { isActive: true };

  // Nếu có petId, thêm điều kiện lọc theo pet
  if (petId) {
    queryConditions.pet = petId;
  }

  return toLeanQuery(
    Product.find(queryConditions).sort({ createdAt: -1 }).limit(limit)
  );
}

// 2) Xem nhiều nhất
async function getMostViewedProducts(limit = 8) {
  return toLeanQuery(
    Product.find({ isActive: true }).sort({ viewCount: -1, _id: 1 }).limit(limit)
  );
}

// 3) Khuyến mãi cao nhất
//   - Không cần lưu discountPercent; tính tạm thời bằng aggregation.
async function getTopDiscountProducts(limit = 4) {
  const pipeline = [
    { $match: { isActive: true, compareAtPrice: { $gt: 0 }, price: { $gte: 0 } } },
    {
      $addFields: {
        discountPercent: {
          $multiply: [
            {
              $cond: [
                { $gt: ["$compareAtPrice", 0] },
                { $divide: [{ $subtract: ["$compareAtPrice", "$price"] }, "$compareAtPrice"] },
                0,
              ],
            },
            100,
          ],
        },
      },
    },
    { $sort: { discountPercent: -1, _id: 1 } },
    { $limit: limit },
    {
      $project: {
        name: 1,
        slug: 1,
        price: 1,
        compareAtPrice: 1,
        thumbnail: 1,
        images: 1,
        viewCount: 1,
        soldCount: 1,
        createdAt: 1,
        discountPercent: 1,
      },
    },
  ];

  const data = await Product.aggregate(pipeline);
  return data;
}

// 4) Bán chạy nhất
//   Phương án A (nhanh): sort theo Product.soldCount (nếu bạn cập nhật soldCount khi đơn “paid/completed”).
async function getBestSellersByCounter(limit = 6) {
  return toLeanQuery(
    Product.find({ isActive: true, soldCount: { $gt: 0 } })
      .sort({ soldCount: -1, _id: 1 })
      .limit(limit)
  );
}

//   Phương án B (chính xác theo đơn hàng): aggregate từ Order
async function getBestSellersFromOrders(limit = 6) {
  const pipeline = [
    { $match: { status: { $in: ["paid", "completed"] }, paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalQty: { $sum: "$items.qty" },
      },
    },
    { $sort: { totalQty: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    { $match: { "product.isActive": true } },
    {
      $project: {
        _id: "$product._id",
        name: "$product.name",
        slug: "$product.slug",
        price: "$product.price",
        compareAtPrice: "$product.compareAtPrice",
        thumbnail: "$product.thumbnail",
        images: "$product.images",
        viewCount: "$product.viewCount",
        soldCount: "$product.soldCount",
        createdAt: "$product.createdAt",
        totalQty: 1,
      },
    },
  ];

  return Order.aggregate(pipeline);
}

// Wrapper: tự chọn phương án
async function getBestSellers(limit = 6, mode = "auto") {
  if (mode === "counter") return getBestSellersByCounter(limit);
  if (mode === "orders") return getBestSellersFromOrders(limit);
  // auto: ưu tiên aggregation từ đơn hàng, fallback sang counter
  try {
    const rows = await getBestSellersFromOrders(limit);
    if (rows?.length) return rows;
    return getBestSellersByCounter(limit);
  } catch {
    return getBestSellersByCounter(limit);
  }
}

// Lấy tất cả sản phẩm có phân trang
async function getAllProducts({ page = 1, limit = 12 }) {
  const skipAmount = (page - 1) * limit;

  // Chạy 2 câu lệnh truy vấn song song để tăng hiệu suất
  const [products, totalCount] = await Promise.all([
    // 1. Lấy sản phẩm cho trang hiện tại
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit)
      .select(PUBLIC_FIELDS) // Tái sử dụng PUBLIC_FIELDS
      .lean(),
      
    // 2. Đếm tổng số sản phẩm (không phân trang)
    Product.countDocuments({ isActive: true })
  ]);

  return {
    products,
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit), // Tính tổng số trang
  };
}

module.exports = {
  getNewestProducts,
  getMostViewedProducts,
  getTopDiscountProducts,
  getBestSellers,
  getAllProducts
};
