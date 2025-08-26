import axiosClient from "./axiosClient";

const BASE = "/auth";

export const registerApi = (data) => {
  return axiosClient.post(`${BASE}/register`, data);
};

export const verifyOtpApi = (data) => {
  return axiosClient.post(`${BASE}/verify-otp`, data);
};

export const resendOtpApi = (data) => {
  return axiosClient.post(`${BASE}/resend-otp`, data);
};

export const loginApi = (data) => axiosClient.post(`${BASE}/login`, data);
// server trả { accessToken } và tự set cookie refreshToken

export const meApi = () => axiosClient.get(`${BASE}/me`); // route đã bảo vệ

export const logoutApi = () => axiosClient.post(`${BASE}/logout`, {}, { withCredentials: true });
// server sẽ clear cookie refreshToken; client tự xoá access token

// Yêu cầu gửi OTP reset
export const requestResetOtpApi = (email) =>
  axiosClient.post(`${BASE}/forgot-password`, { email });

// Đặt lại mật khẩu bằng OTP
export const resetPasswordApi = ({ email, otp, newPassword }) =>
  axiosClient.post(`${BASE}/reset-password`, { email, otp, newPassword });
