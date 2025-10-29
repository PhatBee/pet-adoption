import axiosClient from './axiosClient';
import { BaseRef } from '../../types/next';

const petApi = {
    findAll: async (): Promise<BaseRef[]> => {
        const { data } = await axiosClient.get('/admin/pets');
        return data;
    },
};

export default petApi;