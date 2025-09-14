const cart = require("../models/Cart");
const Product = require("../models/Product");

// Lấy giỏ hàng của user hiện tại
const getCartByUser = async (userId) => {
  return await Cart.findOne({ user: userId }).populate("items.product");
};

// Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng
const addProductToCart = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("NOT_FOUND");
  if (product.stock < quantity) throw new Error("OUT_OF_STOCK");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return cart;
};

module.exports = { getCartByUser, addProductToCart };