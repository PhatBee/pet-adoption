// store/api/inventoryApi.ts

import { PaginatedResult, Product } from '../../types/next';
import axiosClient from './axiosClient';
import { InventoryQueryDto, UpdateStockDto } from '../../types/inventory.dto';

const API_URL = '/admin/inventory';

const inventoryApi = {
  findAll: async (
    query: InventoryQueryDto,
  ): Promise<PaginatedResult<Product>> => {
    const { data } = await axiosClient.get(API_URL, { params: query });
    return data;
  },

  updateStock: async (
    id: string,
    dto: UpdateStockDto,
  ): Promise<Product> => {
    const { data } = await axiosClient.patch(`${API_URL}/${id}/stock-in`, dto);
    return data;
  },
};

export default inventoryApi;