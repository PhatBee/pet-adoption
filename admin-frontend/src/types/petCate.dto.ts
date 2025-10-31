import { PaginatedResult } from './next';

export interface CreateDto {
  name: string;
}

export interface QueryDto {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ResponseDto {
  _id: string;
  name: string;
  productCount: number;
}

export type PaginatedData = PaginatedResult<ResponseDto>;