const Cart = require("../models/Cart");
const {Product} = require("../models/Product");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Coupon = require('../models/Coupon')

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

// Tao đơn hàng từ giỏ hàng
const createOrderFromCart = async ({ userId, shippingAddress, paymentMethod, items, couponCode, pointsToUse }) => {
  // Bắt đầu phiên giao dịch
  const session = await mongoose.startSession();

  try {
    let createdOrder;
    await session.withTransaction(async () => {
      // --- Lấy dữ liệu người dùng và sản phẩm ---
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("Người dùng không tồn tại");

      // Danh sách ID của các sản phẩm cần đặt hàng
      const productIdsToOrder = items.map(item => item.product._id);

      // Lấy thông tin mới nhất của các sản phẩm này từ DB để đảm bảo dữ liệu (giá, tồn kho) là chính xác
      const productsInDb = await Product.find({ '_id': { $in: productIdsToOrder } }).session(session);

      // Tạo một map để dễ dàng truy xuất thông tin sản phẩm
      const productMap = new Map(productsInDb.map(p => [p._id.toString(), p]));


      // Kiểm tra tồn kho, tính tổng tiền hàng
      let itemsTotal = 0;
      const orderItems = items.map((item) => {
        const product = productMap.get(item.product._id);
        const quantity = item.quantity;
        if (!product) throw new Error("Sản phẩm trong giỏ hàng không tồn tại");
        if (product.stock < quantity) throw new Error(`Sản phẩm ${product.name} không đủ hàng`);

        const price = product.price;
        const lineTotal = price * quantity;
        itemsTotal += lineTotal;

        // snapshot thông tin sản phẩm
        const productSnapshot = {
          id: product._id,
          name: product.name,
          price: product.price,
          thumbnail: product.thumbnail,
          description: product.description,
          slug: product.slug,
          category: product.category,
          compareAtPrice: product.compareAtPrice,
          image: product.images || null
        };

        return { product: product._id, productSnapshot: productSnapshot, quantity: quantity };
      });

      // --- 2. Xử lý giảm giá ---
      let couponDiscount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() }).session(session);
        // Xác thực lại coupon ngay tại thời điểm đặt hàng
        if (!coupon || !coupon.isActive || coupon.expiresAt < new Date() || itemsTotal < coupon.minOrderValue) {
          throw { status: 400, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
        }
        appliedCoupon = coupon; // Lưu lại để tăng usesCount sau

        if (coupon.discountType === 'percentage') {
          couponDiscount = (itemsTotal * coupon.discountValue) / 100;
        } else { // fixed_amount
          couponDiscount = coupon.discountValue;
        }
        // Đảm bảo giảm giá không vượt quá tổng tiền hàng
        couponDiscount = Math.min(couponDiscount, itemsTotal);
      }

      // --- 3. Xử lý điểm tích lũy (xu) ---
      let pointsDiscount = 0;
      const pointsToUseNum = Number(pointsToUse) || 0;

      if (pointsToUseNum > 0) {
        if (user.loyaltyPoints < pointsToUseNum) {
          throw { status: 400, message: 'Bạn không đủ điểm tích lũy' };
        }
        // Giả sử 1 điểm = 1đ
        pointsDiscount = pointsToUseNum;
        // Đảm bảo số điểm sử dụng không vượt quá số tiền còn lại sau khi đã áp dụng coupon
        pointsDiscount = Math.min(pointsDiscount, itemsTotal - couponDiscount);
      }

      // --- 4. Tính toán tổng cuối cùng ---
      const total = itemsTotal - couponDiscount - pointsDiscount;

      // 5. TẠO GIỜ HẾT HẠN CHO ĐƠN HÀNG VNPAY
      let expiresAt = null;
      if (paymentMethod === "VNPAY") {
        // Cho đơn hàng 15 phút để thanh toán
        expiresAt = new Date(Date.now() + 15 * 60 * 1000); 
      }

      // 6. Tạo đơn hàng và lưu thông tin giảm giá
      const order = new Order({
        user: userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsTotal,
        couponCode: couponCode || null,
        couponDiscount,
        pointsUsed: pointsToUseNum,
        pointsDiscount,
        total,
        status: "pending",
        orderStatusHistory: [{ status: "pending", orderedAt: new Date() }],
        expiresAt: expiresAt
      });

      await order.save({ session });
      createdOrder = order;

      // 7. Cập nhật dữ liệu database
      // Cập nhật tồn kho sản phẩm
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product._id },
          { $inc: { stock: -item.quantity, soldCount: item.quantity } },
          { session }
        );
      }
      // Cập nhật số xu của người dùng
      if (pointsToUseNum > 0) {
        user.loyaltyPoints -= pointsToUseNum;
      }
      // Thưởng điểm cho đơn hàng này (ví dụ: 1% giá trị đơn hàng)
      user.loyaltyPoints += Math.floor(itemsTotal / 100);
      await user.save({ session });
      // Tăng số lần sử dụng của coupon
      if (appliedCoupon) {
        appliedCoupon.usesCount += 1;
        await appliedCoupon.save({ session });
      }
      // Xóa sản phẩm đã mua khỏi giỏ hàng      
      const userCart = await Cart.findOne({ user: userId }).session(session);
      if (userCart) {
        userCart.items = userCart.items.filter(
          cartItem => !productIdsToOrder.includes(cartItem.product.toString())
        );
        await userCart.save({ session });
      }
    });



    return { order: createdOrder };

  } catch (error) {

    // // Dự phòng: nếu lỗi trong transaction, rollback thủ công
    // if (error.message && error.message.match("/transactions/")) {
    //   // Fallback: rollback thủ công
    //   return await createOrderFromCartFallback({ userId, shippingAddress, paymentMethod });
    // }
    console.error("Lỗi trong transaction khi tạo đơn hàng:", error);
    throw error;
  } finally {
    // Kết thúc phiên giao dịch
    session.endSession();
  }
}
module.exports = { getCartByUser, addProductToCart, updateCartItem, removeCartItem, clearCart, createOrderFromCart };