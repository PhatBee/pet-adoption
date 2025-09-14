import axiosClient from "./axiosClient";
const BASE = "/cart";

export const cartApi = {
    addItem: (item) => {
        return axiosClient.post(`${BASE}/add`, item);
    },
    
    getCart: () => {
        return axiosClient.get(`${BASE}`);
    },
};
