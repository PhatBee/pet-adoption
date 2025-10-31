import axiosClient from "./axiosClient";

const couponApi = {
  // Gửi mã code và tổng tiền hàng để backend xác thực
  validate: (payload) => axiosClient.post("/coupons/validate", payload),

  // Lấy danh sách (giờ đã yêu cầu auth)
  getActiveCoupons: () => axiosClient.get("/coupons"),

  // Thêm hàm mới: Lưu coupon
  saveCoupon: (couponId) => axiosClient.post("/coupons/save", { couponId }),

  /**
   * Lấy danh sách coupon đã lưu, tính toán cho giỏ hàng
   * @param {Array} items - Danh sách sản phẩm trong giỏ hàng
   */
  getSavedForCheckout: (items) => axiosClient.post("/coupons/saved", { items }),
};

export default couponApi;