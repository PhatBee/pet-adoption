import axiosClient from "./axiosClient";

const adminApi = {
  getRevenueStats: (type) => axiosClient.get(`/admin/stats/revenue`, { params: { type } }),
};

export default adminApi;