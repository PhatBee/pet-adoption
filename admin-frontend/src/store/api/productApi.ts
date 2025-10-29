import axiosClient from './axiosClient';

const API_URL = '/admin/products';
import {
    Product,
    CreateProductDto,
    UpdateProductDto,
    ProductQueryDto,
    PaginatedResult
} from '../../types/next';

const productApi = {
    getProducts: async (query: ProductQueryDto): Promise<PaginatedResult<Product>> => {
        const { data } = await axiosClient.get(API_URL, { params: query });
        return data;
    },

    getProductById: async (id: string): Promise<Product> => {
        const { data } = await axiosClient.get(`/admin/products/${id}`);
        return data;
    },

    createProduct: async (dto: CreateProductDto): Promise<Product> => {
        const { data } = await axiosClient.post('/admin/products', dto);
        return data;
    },

    updateProduct: async (id: string, dto: UpdateProductDto): Promise<Product> => {
        const { data } = await axiosClient.patch(`/admin/products/${id}`, dto);
        return data;
    },

    disableProduct: async (id: string): Promise<Product> => {
        const { data } = await axiosClient.patch(`/admin/products/${id}/disable`);
        return data;
    },

    enableProduct(id: string) {
        return axiosClient.patch(`/admin/products/${id}/enable`);
    },

    uploadSingleImage: async (file: File): Promise<{ filePath: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axiosClient.post('/admin/products/upload/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    uploadMultipleImages: async (formData: FormData): Promise<{ filePath: string }[]> => {
        const { data } = await axiosClient.post('/admin/products/upload/multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};

export default productApi;