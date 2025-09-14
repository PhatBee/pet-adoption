const cartService = require("../services/cartService");


// Lấy giỏ hàng của user hiện tại
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await cartService.getCartByUser(userId);
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
        const cart = await cartService.addProductToCart(userId, productId, quantity);
        res.json(cart);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        if (error.message === "OUT_OF_STOCK") {
            return res.status(400).json({ message: "Sản phẩm không đủ hàng" });
        }
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports = { getCart, addToCart };
