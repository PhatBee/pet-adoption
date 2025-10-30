import {
  IsString, IsNotEmpty, IsEnum, IsNumber, Min, IsOptional,
  IsDateString, IsBoolean, IsMongoId, IsArray, ValidateIf,
} from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { CouponApplyType, DiscountType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @IsString() @IsNotEmpty() code: string;
  @IsEnum(DiscountType) @IsNotEmpty() discountType: DiscountType;
  @IsNumber() @Min(0) discountValue: number;
  @IsOptional() @IsNumber() @Min(0) maxDiscountValue?: number;
  @IsOptional() @IsNumber() @Min(0) minOrderValue?: number;
  @IsOptional() @IsDateString() startsAt?: Date;
  @IsOptional() @IsDateString() expiresAt?: Date;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsNumber() @Min(1) maxUses?: number;
  @IsOptional() @IsEnum(CouponApplyType) appliesTo?: CouponApplyType;
  @IsOptional() @IsArray() @IsMongoId({ each: true }) @ValidateIf((o) => o.appliesTo === CouponApplyType.SPECIFIC_PRODUCTS) productIds?: MongooseSchema.Types.ObjectId[];
  @IsOptional() @IsArray() @IsMongoId({ each: true }) @ValidateIf((o) => o.appliesTo === CouponApplyType.SPECIFIC_CATEGORIES) categoryIds?: MongooseSchema.Types.ObjectId[];
  @IsOptional() @IsArray() @IsMongoId({ each: true }) @ValidateIf((o) => o.appliesTo === CouponApplyType.SPECIFIC_PET_TYPES) petTypeIds?: MongooseSchema.Types.ObjectId[];
}