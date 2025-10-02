import axiosClient from "./axiosClient";

const WISHLIST_URL = "/wishlist";

export const addWishlist = (productId) => axiosClient.post(WISHLIST_URL, { productId });
export const removeWishlist = (productId) => axiosClient.delete(`${WISHLIST_URL}/${productId}`);
export const getWishlist = () => axiosClient.get(WISHLIST_URL);