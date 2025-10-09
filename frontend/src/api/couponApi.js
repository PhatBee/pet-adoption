import axiosClient from "./axiosClient";

const couponApi = {
  // Gửi mã code và tổng tiền hàng để backend xác thực
  validate: (payload) => axiosClient.post("/coupons/validate", payload),
};

export default couponApi;