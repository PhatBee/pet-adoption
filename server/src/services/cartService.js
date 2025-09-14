const Cart = require("../models/Cart");
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

// Cập nhât số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("NOT_FOUND");
  if (product.stock < quantity) throw new Error("OUT_OF_STOCK");

  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("CART_NOT_FOUND");

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity = quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.populate("items.product");
  await cart.save();

   
  return cart;
};

// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("CART_NOT_FOUND");

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
  }

  await cart.save();
  return cart;
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("CART_NOT_FOUND");

  cart.items = [];
  await cart.save();
  return cart;
};

module.exports = { getCartByUser, addProductToCart, updateCartItem, removeCartItem, clearCart };