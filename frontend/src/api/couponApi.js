import axiosClient from "./axiosClient";

const couponApi = {
  // Gửi mã code và tổng tiền hàng để backend xác thực
  validate: (payload) => axiosClient.post("/coupons/validate", payload),

  // Lấy danh sách (giờ đã yêu cầu auth)
  getActiveCoupons: () => axiosClient.get("/coupons"),

  // Thêm hàm mới: Lưu coupon
  saveCoupon: (couponId) => axiosClient.post("/coupons/save", { couponId }),
};

export default couponApi;