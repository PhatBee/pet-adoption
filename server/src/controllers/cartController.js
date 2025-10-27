const cartService = require("../services/cartService");
const userService = require("../services/userService");
const {createOrderFromCart} = require("../services/cartService");
const { createPaymentUrl: createVnpayUrl } = require("../services/vnpayService"); // Đổi tên để tránh trùng
// 1. Import MoMo service
const { createPaymentRequest: createMomoRequest } = require("../services/momoService");


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
        const { shippingAddress, paymentMethod, items, couponCode, pointsToUse } = req.body;

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
        const  { order }  = await createOrderFromCart({ userId, shippingAddress, paymentMethod, items, couponCode, pointsToUse });

        // --- 2. XỬ LÝ VNPAY ---
        if (paymentMethod === "VNPAY") {
            // Lấy IP client
            const ipAddr = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            // Tạo URL thanh toán
            const vnpayUrl = createVnpayUrl(
                ipAddr,
                order.total, // Tổng số tiền
                order._id.toString(), // Mã đơn hàng
                `Thanh toan don hang ${order._id}` // Thông tin đơn hàng
            );

            // 3. Trả về redirectUrl (frontend sẽ tự động chuyển hướng)
            return res.json({ orderId: order._id, redirectUrl: vnpayUrl });
        }
        // --- 3. XỬ LÝ MOMO ---
        else if (paymentMethod === "MOMO") {
            try {
                const requestId = orderId; // Dùng luôn orderId làm requestId cho đơn giản
                const extraData = Buffer.from(JSON.stringify({ userId: userId })).toString("base64"); // Ví dụ: mã hóa userId vào extraData
                
                const momoResponse = await createMomoRequest(
                    orderId,
                    order.total,
                    `Thanh toan don hang ${orderId}`,
                    requestId,
                    extraData
                );
                
                // Trả về payUrl của MoMo (frontend sẽ redirect)
                return res.json({ orderId: orderId, redirectUrl: momoResponse.payUrl });
            } catch (momoError) {
                 console.error("Lỗi khi tạo yêu cầu MoMo:", momoError);
                 // Cân nhắc hủy đơn hàng đã tạo ở đây nếu gọi MoMo thất bại
                 // await cancelPendingOrderAndRestoreStock(order, "Lỗi tạo link thanh toán MoMo");
                 return res.status(500).json({ message: momoError.message || "Không thể tạo yêu cầu thanh toán MoMo" });
            }
        }

        // 4. Nếu là COD, trả về như cũ
        res.json({ orderId: order._id, order });
    } catch (error) {
        const code = error.status || 500;
        res.status(code).json({ message: error.message || "Lỗi khi tạo đơn hàng" });
        console.error("Lỗi khi tạo đơn hàng:", error);
    }
};

module.exports = { getCart, addToCart, removeCartItem, updateCartItem, clearCart, getCheckoutCart, placeOrder };
