import axios from "axios";
import axiosClient from "./axiosClient";
const BASE = "/products";


async function getAll() {
  const res = await axiosClient.get(`${BASE}/home`);
  return res.data;
}

// Lấy sản phẩm theo trang
const getAllPaginated = ({ page = 1, limit = 12, searchTerm, category, pet, minPrice, maxPrice, sortBy }) => {
  return axiosClient.get(BASE, { params: { page, limit, searchTerm, category, pet, minPrice, maxPrice, sortBy } });
};

const getFilterOptions = () => {
  return axiosClient.get(`${BASE}/filters`);
};

const productApi = {
  getBySlug: (slug) => axiosClient.get(`/products/${encodeURIComponent(slug)}`),
};


export default {
  getAll,
  ...productApi,
  getAllPaginated,
  getFilterOptions, // Export the new function
};
