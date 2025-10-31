const Coupon = require("../models/Coupon");
const UserCoupon = require("../models/UserCoupon"); // 1. Import UserCoupon

/**
 * Cập nhật validateCoupon
 * Giờ sẽ nhận (code, items) thay vì (code, itemsTotal)
 */
const validateCoupon = async (code, items) => {
    // Populate tất cả các điều kiện để gửi về frontend
    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
        .populate('productIds', 'name')
        .populate('categoryIds', 'name')
        .populate('petTypeIds', 'name');
    // 1. Kiểm tra tồn tại
    if (!coupon) {
        throw { status: 404, message: 'Mã giảm giá không tồn tại.' };
    }

    // 2. Kiểm tra mã còn hoạt động không
    if (!coupon.isActive) {
        throw { status: 400, message: 'Mã giảm giá đã bị vô hiệu hóa.' };
    }

    // 3. Kiểm tra ngày hết hạn
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw { status: 400, message: 'Mã giảm giá đã hết hạn.' };
    }

    // // 4. Kiểm tra giá trị đơn hàng tối thiểu
    // if (coupon.minOrderValue > 0 && itemsTotal < coupon.minOrderValue) {
    //     throw { 
    //         status: 400, 
    //         message: `Mã này chỉ áp dụng cho đơn hàng từ ${coupon.minOrderValue.toLocaleString()}đ.` 
    //     };
    // }

    // 2. Dùng hàm helper mới để tính toán
    const { discountAmount } = calculateDiscountInternal(coupon, items);

    // 3. Trả về coupon và số tiền đã tính
    return { coupon: coupon.toObject(), discountAmount };
}

/**
 * Lấy tất cả các coupon CÔNG KHAI, còn hoạt động và chưa hết hạn
 * userId (tùy chọn): Nếu được cung cấp, sẽ kiểm tra xem user đã lưu coupon nào
 */
const getActiveCoupons = async (userId = null) => {
    const now = new Date();

    // 1. Thay đổi logic query: Bỏ .lean() và thêm .populate()
    const couponsQuery = Coupon.find({
        isActive: true, //
        isPublic: true, // 2. Chỉ lấy các coupon công khai
        expiresAt: { $gt: now } // Chỉ lấy mã chưa hết hạn
    })
        .sort({ expiresAt: 1 }) // Ưu tiên mã sắp hết hạn lên đầu
        // Populate để lấy tên từ các model liên quan
        .populate('productIds', 'name') // Chỉ lấy trường 'name' từ model 'Product'
        .populate('categoryIds', 'name') // Chỉ lấy trường 'name' từ model 'Category'
        .populate('petTypeIds', 'name'); // Chỉ lấy trường 'name' từ model 'Pet'

    const coupons = await couponsQuery.exec(); // Chạy query

    // 2. Chuyển Mongoose document sang object (vì đã bỏ .lean())
    let couponObjects = coupons.map(c => c.toObject());

    // 3. Nếu có userId, kiểm tra xem coupon nào đã được lưu, làm trên couponObjects
    if (userId) {
        const savedCoupons = await UserCoupon.find({
            userId,
            couponId: { $in: couponObjects.map(c => c._id) }
        }).select('couponId');

        const savedCouponIds = new Set(savedCoupons.map(sc => sc.couponId.toString()));

        // Thêm cờ isSaved vào mỗi coupon
        couponObjects = couponObjects.map(coupon => ({
            ...coupon,
            isSaved: savedCouponIds.has(coupon._id.toString()),
        }));
    }

    // Nếu không có userId, trả về danh sách coupon_gốc (không có cờ isSaved)
    return couponObjects;
}

/**
 * 4. Thêm hàm mới: Lưu coupon cho user
 */
const saveCouponForUser = async (userId, couponId) => {
    // Kiểm tra coupon có tồn tại và hợp lệ không
    const coupon = await Coupon.findOne({
        _id: couponId,
        isActive: true,
        isPublic: true,
        expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
        throw { status: 404, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn." };
    }

    // Kiểm tra xem đã lưu chưa
    const existingSave = await UserCoupon.findOne({ userId, couponId });
    if (existingSave) {
        throw { status: 400, message: "Bạn đã lưu mã này rồi." };
    }

    // Tạo bản ghi mới
    const userCoupon = new UserCoupon({
        userId,
        couponId
    });

    await userCoupon.save();
    return userCoupon;
}

/**
 * HÀM HELPER MỚI
 * Tính toán chiết khấu thực tế dựa trên danh sách sản phẩm.
 * @param {Object} coupon - Đối tượng coupon từ Mongoose.
 * @param {Array} items - Danh sách sản phẩm trong giỏ hàng (ví dụ: [{ product: {...}, quantity: 1 }]).
 * @returns {Object} { discountAmount, eligibleItemsTotal }
 */
const calculateDiscountInternal = (coupon, items) => {
  let eligibleItemsTotal = 0;

  // Chuyển đổi các mảng ID thành Set<String> để tra cứu nhanh
  const productIds = new Set(coupon.productIds.map(id => id?._id?.toString() || id?.toString()));
  const categoryIds = new Set(coupon.categoryIds.map(id => id?._id?.toString() || id?.toString()));
  const petTypeIds = new Set(coupon.petTypeIds.map(id => id?._id?.toString() || id?.toString()));

  console.log("Coupon: ", coupon.code);  
  console.log("ProductId: ", productIds);
  console.log("categoryIds: ", categoryIds);
  console.log("PettypeID: ", petTypeIds);

  // 1. Tính tổng tiền các sản phẩm hợp lệ
  items.forEach(item => {
    const product = item.product;
    console.log(product);
    const lineTotal = (product.price || 0) * (item.quantity || 1);
    let isEligible = false;

     const catId = product.category?._id?.toString() || product.category?.toString();
  const petTypeId = product.pet?._id?.toString() || product.pet.toString();

  console.log("CatId: " , catId);
  console.log("PetTypeId: ", petTypeId);

    switch (coupon.appliesTo) {
      case 'all_products':
        isEligible = true;
        break;
      case 'specific_products':
        if (productIds.has(product._id.toString())) isEligible = true;
        break;
      case 'specific_categories':
        // Hỗ trợ cả trường hợp category là ID hoặc là object đã populate
        if (categoryIds.has(catId)) isEligible = true;
        break;
      case 'specific_pet_types':
        if (petTypeIds.has(petTypeId)) isEligible = true;
        break;
      case 'specific_categories_and_pet_types':
        // Điều kiện VÀ (AND): Sản phẩm phải khớp CẢ hai danh sách
        if (categoryIds.has(catId) && petTypeIds.has(petTypeId)) {
          isEligible = true;
        }
        break;
        
    }

    if (isEligible) {
      eligibleItemsTotal += lineTotal;
    }
  });

  // 2. Kiểm tra điều kiện
  if (eligibleItemsTotal === 0) {
    throw { status: 400, message: "Mã giảm giá không áp dụng cho sản phẩm nào trong giỏ hàng." };
  }

  if (coupon.minOrderValue > 0 && eligibleItemsTotal < coupon.minOrderValue) {
    throw { 
      status: 400, 
      message: `Mã này yêu cầu tổng sản phẩm hợp lệ tối thiểu ${coupon.minOrderValue.toLocaleString()}đ.` 
    };
  }

  // 3. Tính toán chiết khấu
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (eligibleItemsTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountValue) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
    }
  } else { // fixed_amount
    discountAmount = coupon.discountValue;
  }

  // Đảm bảo chiết khấu không vượt quá tổng tiền của các sản phẩm hợp lệ
  discountAmount = Math.min(discountAmount, eligibleItemsTotal);

  // Làm tròn số tiền giảm giá đến số nguyên gần nhất
  const finalDiscountAmount = Math.round(discountAmount);

  return { discountAmount: finalDiscountAmount, eligibleItemsTotal };
};

/**
 * HÀM MỚI (Cho Bước 2 - UI Modal)
 * Lấy danh sách coupon đã lưu, và tính toán ngay ưu đãi
 */
const getSavedCouponsForCheckout = async (userId, items) => {
    const now = new Date();
    
    // 1. Lấy tất cả coupon đã lưu (chưa dùng) của user
    const savedCoupons = await UserCoupon.find({ userId, isUsed: false })
        .populate({
            path: 'couponId',
            match: { 
                isActive: true, 
                expiresAt: { $gt: now } 
            },
            populate: [ // Populate các điều kiện
                { path: 'productIds', select: 'name' },
                { path: 'categoryIds', select: 'name' },
                { path: 'petTypeIds', select: 'name' },
            ]
        });

    // 2. Lọc và tính toán chiết khấu tiềm năng
    const couponsWithPotential = savedCoupons
        .filter(sc => sc.couponId) // Bỏ qua coupon đã hết hạn/không active
        .map(sc => {
            const coupon = sc.couponId;
            try {
                // Tính thử chiết khấu với giỏ hàng hiện tại
                const { discountAmount } = calculateDiscountInternal(coupon, items);
                return { ...coupon.toObject(), potentialDiscount: discountAmount };
            } catch (error) {
                // Không hợp lệ (ví dụ: không có sản phẩm nào), chiết khấu là 0
                return { ...coupon.toObject(), potentialDiscount: 0 };
            }
        });

    // 3. Sắp xếp: Ưu tiên mã có chiết khấu cao nhất
    return couponsWithPotential.sort((a, b) => b.potentialDiscount - a.potentialDiscount);
};

module.exports = { validateCoupon, getActiveCoupons, saveCouponForUser, getSavedCouponsForCheckout, calculateDiscountInternal };