// src/api/userApi.js
import axiosClient from "./axiosClient";

const BASE = "/users";

export const getProfileApi = () => {
  return axiosClient.get(`${BASE}/profile`);
};

// formData: instance of FormData
export const updateProfileApi = async (formData) => {
  return axiosClient.put(`${BASE}/profile`, formData);
};

// Thêm địa chỉ mới
export const addAddressApi = (addressData) => {
  return axiosClient.post(`${BASE}/addresses`, addressData);
};

// Cập nhật một địa chỉ
export const updateAddressApi = (addressId, addressData) => {
  return axiosClient.put(`${BASE}/addresses/${addressId}`, addressData);
};

// Xóa một địa chỉ
export const deleteAddressApi = (addressId) => {
  return axiosClient.delete(`${BASE}/addresses/${addressId}`);
};

export const changePasswordApi = (passwords) => {
  // passwords sẽ là object { oldPassword, newPassword }
  return axiosClient.put(`${BASE}/password`, passwords);
};

export const deleteAccountApi = () => {
  return axiosClient.delete(`${BASE}/profile`);
};

