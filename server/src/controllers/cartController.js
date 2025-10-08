const cartService = require("../services/cartService");
const userService = require("../services/userService");
const {createOrderFromCart} = require("../services/cartService");


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

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;
        const cart = await cartService.updateCartItem(userId, productId, quantity);
        res.json(cart);
    } catch (error) {
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        if (error.message === "OUT_OF_STOCK") {
            return res.status(400).json({ message: "Sản phẩm không đủ hàng" });
        }
        console.error("Lỗi khi cập nhật sản phẩm trong giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const cart = await cartService.removeCartItem(userId, productId);
        res.json(cart);
    } catch (error) {
        if (error.message === "CART_NOT_FOUND") {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await cartService.clearCart(userId);
        res.json(cart);
    } catch (error) {
        if (error.message === "CART_NOT_FOUND") {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }
        console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// Lấy giỏ hàng để thanh toán
const getCheckoutCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cart = await cartService.getCartByUser(userId);
        const user = await userService.getUserById(userId);

        res.json({
            cart: cart || { user: userId, items: [] },
            address: user?.addresses || [],
        });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng để thanh toán:", error);
        res.status(500).json({ message: "Lỗi khi lấy giỏ hàng để thanh toán" });
    }
};

// Tạo đơn hàng từ giỏ hàng
const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
         // Lấy thêm 'items' từ body
        const { shippingAddress, paymentMethod, items } = req.body;

        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city) {
            return res.status(400).json({ message: "Địa chỉ giao hàng không hợp lệ" });
        }

        // Kiểm tra xem có sản phẩm được gửi lên không
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Vui lòng chọn sản phẩm để đặt hàng" });
        }

        if (paymentMethod && !["COD", "VNPAY"].includes(paymentMethod)) {
            return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
        }

        // Truyền `items` vào service
        const  { order }  = await createOrderFromCart({ userId, shippingAddress, paymentMethod, items });

        // Nếu dùng VNPAY -> trả về URL thanh toán
        if (paymentMethod === "VNPAY") {
            // Tạo URL thanh toán giả lập
            const vnpayUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=${order.total * 100}&vnp_OrderInfo=Thanh+toan+don+hang+${order._id}&vnp_TxnRef=${order._id}`;
            return res.json({ orderId: order._id, paymentUrl: vnpayUrl });
        }

        res.json({ orderId: order._id, order });
    } catch (error) {
        const code = error.status || 500;
        res.status(code).json({ message: error.message || "Lỗi khi tạo đơn hàng" });
        console.error("Lỗi khi tạo đơn hàng:", error);
    }
};

module.exports = { getCart, addToCart, removeCartItem, updateCartItem, clearCart, getCheckoutCart, placeOrder };
