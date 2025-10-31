import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CouponDocument = Document & Coupon & { _id: MongooseSchema.Types.ObjectId };

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum CouponApplyType {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  SPECIFIC_PET_TYPES = 'specific_pet_types',
  SPECIFIC_CATEGORIES_AND_PET_TYPES = 'specific_categories_and_pet_types',

}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    index: true,
  })
  code: string;

  @Prop({ required: true, enum: DiscountType })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ min: 0 })
  maxDiscountValue: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: true, index: true })
  isPublic: boolean;

  @Prop({ default: 0, min: 0 })
  minOrderValue: number;

  @Prop({ required: true, type: Date, default: Date.now })
  startsAt: Date;

  @Prop({ type: Date }) //Có thể điều chỉnh mã không hết hạn
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0, min: 0 })
  usesCount: number;

  @Prop({ min: 0 })
  maxUses: number;

  @Prop({ default: 1, min: 1 })
  usageLimitPerUser: number;

  @Prop({
    type: String,
    enum: CouponApplyType,
    default: CouponApplyType.ALL_PRODUCTS,
  })
  appliesTo: CouponApplyType;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }],
    default: [],
  })
  productIds: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Category' }],
    default: [],
  })
  categoryIds: MongooseSchema.Types.ObjectId[];

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'PetType' }],
    default: [],
  })
  petTypeIds: MongooseSchema.Types.ObjectId[];
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);