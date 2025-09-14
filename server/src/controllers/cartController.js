const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Lấy giỏ hàng của user hiện tại
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
       
        res.json(cart || { user: userId, items: [] });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        if (product.stock < quantity) {
            return res.status(400).json({ message: "Sản phẩm không đủ hàng" });
        }

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
        res.json(cart);
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { getCart, addToCart };
