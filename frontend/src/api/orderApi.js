import axiosClient from "./axiosClient";

const orderApi = {
  fetchMyOrders: ({ page = 1, limit = 10 } = {}) =>
    axiosClient.get("/orders/my", { params: { page, limit } }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
};

export default orderApi;
