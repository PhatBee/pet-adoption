  const Cart = require("../models/Cart");
  const Product = require("../models/Product");
  const mongoose = require("mongoose");
  const Order = require("../models/Order");
  const User = require("../models/User");

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
  const createOrderFromCart = async (userId, shippingAddress, paymentMethod) => {
    // Bắt đầu phiên giao dịch
    const session = await mongoose.startSession();
    let savedOrder = null;
    try {
      let result;
      await session.withTransaction(async () => {
        // Lấy giỏ hàng
        const cart = await Cart.findOne({ user: userId }).populate("items.product").session(session);
        if (!cart || !cart.items.length) throw { status: 400, message: "Giỏ hàng trống" };

        // Kiểm tra tồn kho
        let itemsTotal = 0;
        const orderItems = cart.items.map((item) => {
          const product = item.product;
          const quantity = item.quantity;
          if (!product) throw { status: 400, message: "Sản phẩm trong giỏ hàng không tồn tại" };
          if (product.stock < quantity) throw { status: 400, message: `Sản phẩm ${product.name} không đủ hàng` };

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

        const total = itemsTotal; // Possible add shipping fee, tax, discount, etc.

        // Tạo đơn hàng
        const order = new Order({
          user: userId,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          itemsTotal,
          total,
          status: "pending",
          orderedAt: new Date(),
        });

        savedOrder = await order.save({ session });

        // Cập nhật tồn kho
        for (const item of cart.items) {
          await Product.updateOne(
            { _id: item.product._id },
            { $inc: { stock: -item.quantity, soldCount: item.quantity } },
            { session }
          );
        }

        // Xóa các item đã đặt khỏi giỏ hàng
        cart.items = [];
        await cart.save({ session });

        if (savedOrder) {
          const job = await autoConfirmQueue.add(
          { orderId: savedOrder._id },
          {
            delay: 30 * 60 * 1000, // 30 phút
            attempts: 3,
            backoff: { type: "exponential", delay: 60 * 1000 },
            removeOnComplete: true,
            removeOnFail: false,
          }
        );

        // Lưu jobId vào order (ngoài transaction)
        savedOrder.autoConfirmJobId = job.id.toString();
        await savedOrder.save();
      }
      // Kết thúc phiên giao dịch
      session.endSession();

      return { order: savedOrder };
      });

    } catch (error) {
      session.endSession();

      // Dự phòng: nếu lỗi trong transaction, rollback thủ công
      if (error.message && error.message.match("/transactions/")) {
        // Fallback: rollback thủ công
        return await createOrderFromCartFallback({ userId, shippingAddress, paymentMethod });
      }

      throw error;
    }
  }
  // Fallback: tạo đơn hàng từ giỏ hàng nếu lỗi trong transaction
  const createOrderFromCartFallback = async ({ userId, shippingAddress, paymentMethod }) => {
    // Lấy giỏ hàng
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || !cart.items.length) throw { status: 400, message: "Giỏ hàng trống" };

    let itemsTotal = 0;
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      const quantity = item.quantity;
      if (!product) throw { status: 400, message: "Sản phẩm trong giỏ hàng không tồn tại" };
      if (product.stock < quantity) throw { status: 400, message: `Sản phẩm ${product.name} không đủ hàng` };

      itemsTotal += product.price * quantity;
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

      orderItems.push({ product: product._id, productSnapshot: productSnapshot, quantity: quantity });
    }

    const total = itemsTotal; // Possible add shipping fee, tax, discount, etc.

    // Tạo đơn hàng
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      total,
      status: "pending",
      orderedAt: new Date(),
    });

    await order.save();

    // Cập nhật tồn kho
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } }
      );
    }

    // Xóa các item đã đặt khỏi giỏ hàng
    cart.items = [];
    await cart.save();

    return { order };
  }

  module.exports = { getCartByUser, addProductToCart, updateCartItem, removeCartItem, clearCart, createOrderFromCart };