import axios from "axios";
import axiosClient from "./axiosClient";
const BASE = "/products";


async function getAll() {
  const res = await axiosClient.get(`${BASE}/home`);
  return res.data;
}

// Lấy sản phẩm theo trang
const getAllPaginated = ({ page = 1, limit = 12 }) => {
  // Gửi page và limit làm query params
  return axiosClient.get(BASE, { params: { page, limit } });
};

const productApi = {
  getBySlug: (slug) => axiosClient.get(`/products/${encodeURIComponent(slug)}`),
};

export default {
  getAll,
  ...productApi,
  getAllPaginated,
};
