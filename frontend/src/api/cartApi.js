import axiosClient from "./axiosClient";
const BASE = "/cart";

export const cartApi = {
    addItem: (item) => {
        return axiosClient.post(`${BASE}/add`, item);
    },

    removeItem: (itemId) => {
        return axiosClient.delete(`${BASE}/remove/${itemId}`);
    },

    updateItem: (item) => {
        return axiosClient.put(`${BASE}/update`, item);
    },

    clearCart: () => {
        return axiosClient.delete(`${BASE}/clear`);
    },
    
    getCart: () => {
        return axiosClient.get(`${BASE}`);
    },

    checkout: (order) => {
        return axiosClient.post(`${BASE}/checkout`, order);
    },
};

export default cartApi;