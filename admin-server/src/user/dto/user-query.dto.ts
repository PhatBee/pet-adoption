import { IsOptional, IsString, IsNumber, IsBoolean, IsIn, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { Address, User } from '../schemas/user.schema';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @Transform(({ value }) => {
    if (typeof value === 'string') return value === 'true';
    return !!value;
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface UserDetailDto {
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
  createdAt: Date;
  updatedAt: Date;
  totalSpend?: number;
  totalOrders?: number;
}

export interface PaginatedUserResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}