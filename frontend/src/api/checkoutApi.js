import axiosClient from "./axiosClient";

const checkoutApi = {
  getCheckoutData: () => axiosClient.get("/checkout"),
  placeOrder: (payload) => axiosClient.post("/checkout/orders", payload),
};

export default checkoutApi;
