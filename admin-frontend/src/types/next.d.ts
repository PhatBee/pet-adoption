import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { CouponFormSchema } from '../../libs/validations/coupon.schema';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export interface ListOrdersQueryDto {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
}

export interface BaseRef {
  _id: string;
  name: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  compareAtPrice: number;
  images: string[] | null;
  thumbnail?: string;
  stock: number;
  category: BaseRef | string;
  pet: BaseRef | string;
  brand?: string | null;
  soldCount: number;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQueryDto {
  search?: string;
  categoryId?: string;
  petId?: string;
  page: number;
  limit: number;
}

export interface CreateProductDto {
  name: string;
  slug?: string;
  price: number;
  stock: number;
  shortDescription?: string | null;
  description?: string | null;
  compareAtPrice?: number;
  images?: string[];
  thumbnail?: string | null;
  category: string; 
  pet: string;      
  brand?: string | null;
  manufacturer?: string | null;
  country?: string | null;
  itemWeight?: string | null;
  dimensions?: string | null;
  category: string;
  pet: string;
}

export type UpdateProductDto = Partial<CreateProductDto> & {
  isActive?: boolean;
};

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

//User
export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  ward?: string | null;
  district?: string | null;
  city: string;
  isDefault?: boolean;

}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  phone?: string | null;
  isVerified: boolean;
  isActive: boolean;
  addresses: Address[];
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
  totalSpend?: number;
  totalOrders?: number;
}

export interface UserQueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  startsAt: string;
  expiresAt?: string;
  isActive: boolean;
  isPublic: boolean;
  usesCount: number;
  maxUses?: number;
  usageLimitPerUser: number;
  appliesTo: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_pet_types';
  productIds: string[];
  categoryIds: string[];
  petTypeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CouponQueryDto {
  page?: number;
  limit?: number;
  isActive?: boolean;
  code?: string;
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountValue?: number;
  minOrderValue?: number;
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
  isPublic?: boolean;
  maxUses?: number;
  appliesTo?: 'all_products' | 'specific_products' | 'specific_categories' | 'specific_pet_types';
  productIds?: string[];
  categoryIds?: string[];
  petTypeIds?: string[];
}

export type UpdateCouponDto = Partial<CreateCouponDto>;