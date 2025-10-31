import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsMongoId,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { CouponApplyType, DiscountType } from '../schemas/coupon.schema';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer'; // Cần cho QueryDto

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: Date;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  
  // Thêm 2 trường mới (từ ý tưởng lần trước)
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
  // ---

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  productIds?: MongooseSchema.Types.ObjectId[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categoryIds?: MongooseSchema.Types.ObjectId[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  petTypeIds?: MongooseSchema.Types.ObjectId[];
}

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

export class CouponQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}