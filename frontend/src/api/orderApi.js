import axiosClient from "./axiosClient";

const orderApi = {
  fetchMyOrders: ({ page = 1, limit = 10 } = {}) =>
    axiosClient.get("/orders/my", { params: { page, limit } }),
  // getOrderById: (id) => axiosClient.get(`/orders/${id}`),

  getOrderDetail: (orderId) => axiosClient.get(`/orders/${orderId}`), // trả { order, reviews }
  postReview: (orderId, payload) => axiosClient.post(`/orders/${orderId}/reviews`, payload),
};


export default orderApi;
