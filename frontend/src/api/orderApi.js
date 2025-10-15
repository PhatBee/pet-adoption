import axiosClient from "./axiosClient";

const orderApi = {
  fetchMyOrders: ({ page = 1, limit = 10, status = null } = {}) =>
    axiosClient.get("/orders/my", { params: { page, limit, status } }),
  // getOrderById: (id) => axiosClient.get(`/orders/${id}`),

  getOrderDetail: (orderId) => axiosClient.get(`/orders/${orderId}`), // trả { order, reviews }
  postReview: (orderId, payload) => axiosClient.post(`/orders/${orderId}/reviews`, payload),

  productSnapshot: (orderId, productId) => axiosClient.get(`/orders/${orderId}/item/${productId}/snapshot`)
};


export default orderApi;
