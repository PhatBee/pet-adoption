import axiosClient from '../../store/api/axiosClient';
import { User, UserQueryDto, PaginatedResult } from '../../types/next';

const userApi = {
    getUsers: async (query: UserQueryDto): Promise<PaginatedResult<User>> => {
        const { data } = await axiosClient.get('/admin/users', { params: query });
        return data;
    },

    getUserById: async (id: string): Promise<User> => {
        const { data } = await axiosClient.get(`/admin/users/${id}`);
        return data;
    },

    disableUser: async (id: string): Promise<User> => {
        const { data } = await axiosClient.patch(`/admin/users/${id}/disable`);
        return data;
    },

    enableUser: async (id: string): Promise<User> => {
        const { data } = await axiosClient.patch(`/admin/users/${id}/enable`);
        return data;
    },
};

export default userApi;