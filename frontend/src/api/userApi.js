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

