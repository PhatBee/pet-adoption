import axiosClient from "./axiosClient";


export const registerApi = (data) => {
  return axiosClient.post("/register", data);
};

export const verifyOtpApi = (data) => {
  return axiosClient.post("/verify-otp", data);
};

export const resendOtpApi = (data) => {
  return axiosClient.post("/resend-otp", data);
};

export const loginApi = (data) => axiosClient.post("/login", data);
// server trả { accessToken } và tự set cookie refreshToken

export const meApi = () => axiosClient.get("/me"); // route đã bảo vệ

export const logoutApi = () => axiosClient.post("/logout");
// server sẽ clear cookie refreshToken; client tự xoá access token

// Yêu cầu gửi OTP reset
export const requestResetOtpApi = (email) =>
  axiosClient.post("/forgot-password", { email });

// Đặt lại mật khẩu bằng OTP
export const resetPasswordApi = ({ email, otp, newPassword }) =>
  axiosClient.post("/reset-password", { email, otp, newPassword });
