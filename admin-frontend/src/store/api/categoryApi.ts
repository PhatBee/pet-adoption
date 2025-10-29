import axiosClient from './axiosClient';
import { BaseRef } from '../../types/next';

const categoryApi = {
    findAll: async (): Promise<BaseRef[]> => {
        const { data } = await axiosClient.get('/admin/categories');
        return data;
    },
};

export default categoryApi;