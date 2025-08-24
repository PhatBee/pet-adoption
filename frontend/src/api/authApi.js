import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const registerApi = (data) => {
  return axios.post(`${API_URL}/register`, data);
};

export const verifyOtpApi = (data) => {
  return axios.post(`${API_URL}/verify-otp`, data);
};

export const resendOtpApi = (data) => {
  return axios.post(`${API_URL}/resend-otp`, data);
};

