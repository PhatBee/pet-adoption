const User = require("../models/User.js");
const Product = require("../models/Product.js");
const Wishlist = require("../models/Wishlist");

// Thêm sản phẩm vào wishlist
const addWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  const product = await Product.findById(productId);

  if (!user || !product) throw new Error("User or Product not found");

  // Kiểm tra trùng
  const exist = await Wishlist.findOne({user: userId, product: productId });
  // if (user.wishlist.includes(productId)) {
  if (exist)
    return { message: "Sản phẩm đã có trong wishlist" };

  await Wishlist.create({ user: userId, product: productId });

  return { message: "Đã thêm sản phẩm vào wishlist" };
  }

// Xóa sản phẩm khỏi wishlist
const removeWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Xóa sản phẩm khỏi collection Wishlist
  await Wishlist.findOneAndDelete({ user: userId, product: productId });

  return { message: "Đã xóa sản phẩm khỏi wishlist" };
};

// Lấy danh sách wishlist (populate để lấy chi tiết sản phẩm)
const getWishlist = async (userId) => {
const wishlist = await Wishlist.find({ user: userId }).populate("product");
  // const user = await User.findById(userId).populate('wishlist');
  return wishlist
};

module.exports = { addWishlist, removeWishlist, getWishlist };
