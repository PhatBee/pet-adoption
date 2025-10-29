// services/productService.js
const { Product, Pet, Category } = require("../models/Product");
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
async function getNewestProducts(limit = 8, petId = null, excludeId = null) {
  // Xây dựng điều kiện query cơ bản
  const queryConditions = { isActive: true };

  // Nếu có petId, thêm điều kiện lọc theo pet
  if (petId) {
    queryConditions.pet = petId;
  }

  // Thêm điều kiện: _id không phải là excludeId
  if (excludeId) {
    queryConditions._id = { $ne: excludeId }; // $ne = Not Equal
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

// 2. Thêm hàm mới để lấy sản phẩm theo thể loại
async function getProductsByCategory(categoryId, limit = 8, excludeId = null) {
  const queryConditions = { 
    isActive: true, 
    category: categoryId 
  };
  if (excludeId) {
    queryConditions._id = { $ne: excludeId };
  }
  
  // Sắp xếp theo bán chạy hoặc mới nhất để tăng liên quan
  return toLeanQuery(
    Product.find(queryConditions)
      .sort({ soldCount: -1, createdAt: -1 })
      .limit(limit)
  );
}

// Lấy tất cả sản phẩm có phân trang
async function getAllProducts({ 
  page = 1, 
  limit = 12,
  searchTerm,
  category,
  pet,
  minPrice,
  maxPrice,
  sortBy 
}) {
  const skipAmount = (page - 1) * limit;

  // 1. Xây dựng đối tượng điều kiện truy vấn (query) động
  const queryConditions = { isActive: true };

   if (searchTerm) {
    // Tìm kiếm không phân biệt chữ hoa/thường trong tên sản phẩm
    queryConditions.name = { $regex: searchTerm, $options: 'i' };
  }

  if (category) {
    // Nếu category được gửi lên, nó phải là ID
    queryConditions.category = category;
  }
  if (pet) {
    // Tương tự cho pet
    queryConditions.pet = pet;
  }
  if (minPrice || maxPrice) {
    queryConditions.price = {};
    if (minPrice) {
      queryConditions.price.$gte = Number(minPrice);
    }
    if (maxPrice) {
      queryConditions.price.$lte = Number(maxPrice);
    }
  }

  // 2. Xây dựng đối tượng sắp xếp (sort) động
  let sortOptions = { createdAt: -1 }; // Mặc định: mới nhất
  if (sortBy) {
    switch (sortBy) {
      case 'price-asc':
        sortOptions = { price: 1 };
        break;
      case 'price-desc':
        sortOptions = { price: -1 };
        break;
      case 'name-asc':
        sortOptions = { name: 1 };
        break;
      case 'name-desc':
        sortOptions = { name: -1 };
        break;
    }
  }

  // 3. Chạy truy vấn song song để lấy sản phẩm và tổng số lượng
  const [products, totalCount] = await Promise.all([
    Product.find(queryConditions)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(limit)
      .populate('pet', 'name') // Lấy thêm thông tin để hiển thị nếu cần
      .populate('category', 'name')
      .lean(),
      
    // Đếm tổng số sản phẩm không phân trang  
    Product.countDocuments(queryConditions)
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
  getAllProducts,
  getProductsByCategory
};
