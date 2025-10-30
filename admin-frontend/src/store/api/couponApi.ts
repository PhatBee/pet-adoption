import { PaginatedResult } from '../../types/next';
import axiosClient from './axiosClient';
import { Coupon, CreateCouponDto, UpdateCouponDto, CouponQueryDto } from '../../types/next';

const API_URL = '/admin/coupons';

const couponApi = {
  findAll: async (
    query: CouponQueryDto,
  ): Promise<PaginatedResult<Coupon>> => {
    const { data } = await axiosClient.get(API_URL, { params: query });
    return data;
  },

  findOne: async (id: string): Promise<Coupon> => {
    const { data } = await axiosClient.get(`/admin/coupons/${id}`);
    return data;
  },

  create: async (dto: CreateCouponDto): Promise<Coupon> => {
    const { data } = await axiosClient.post('/admin/coupons', dto);
    return data;
  },

  update: async (id: string, dto: UpdateCouponDto): Promise<Coupon> => {
    const { data } = await axiosClient.patch(`/admin/coupons/${id}`, dto);
    return data;
  },

  disable: async (id: string): Promise<Coupon> => {
    const { data } = await axiosClient.patch(`/admin/coupons/${id}/disable`);
    return data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosClient.delete(`/admin/coupons/${id}`);
    return data;
  },
};

export default couponApi;