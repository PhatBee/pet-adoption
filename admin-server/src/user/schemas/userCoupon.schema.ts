import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Coupon } from '../../coupon/coupon.schema';

export type UserCouponDocument = UserCoupon & Document;

@Schema({ timestamps: true })
export class UserCoupon {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Coupon',
    required: true,
    index: true,
  })
  couponId: Coupon;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ type: Date })
  usedAt: Date;
}

export const UserCouponSchema = SchemaFactory.createForClass(UserCoupon);

UserCouponSchema.index({ userId: 1, couponId: 1 }, { unique: true });