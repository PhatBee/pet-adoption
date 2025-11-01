import axiosClient from './axiosClient';
import { PaginatedResult } from '../../types/next';
import { QueryDto, CreateDto, ResponseDto, PaginatedData } from '../../types/petCate.dto';

const API_URL = '/admin/pets';

const petApi = {
  findAll: async (query: QueryDto): Promise<PaginatedData> => {
    const { data } = await axiosClient.get(API_URL, { params: query });
    return data;
  },
  create: async (dto: CreateDto): Promise<ResponseDto> => {
    const { data } = await axiosClient.post(API_URL, dto);
    return data;
  },
  update: async (id: string, dto: CreateDto): Promise<ResponseDto> => {
    const { data } = await axiosClient.patch(`${API_URL}/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosClient.delete(`${API_URL}/${id}`);
    return data;
  },
};

export default petApi;