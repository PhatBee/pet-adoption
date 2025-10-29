import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Product } from '../../product/schemas/product.schema';

@Schema({ _id: false })
export class OrderStatusHistory {
  @Prop({ required: true })
  status: string;

  @Prop({ default: Date.now })
  changedAt: Date;
}
export const OrderStatusHistorySchema = SchemaFactory.createForClass(OrderStatusHistory);

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: Object, required: true })
  productSnapshot: Record<string, any>;

  @Prop({ required: true })
  quantity: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class Address {
  @Prop()
  fullName: string;

  @Prop()
  phone: string;

  @Prop()
  street: string;

  @Prop()
  ward: string;

  @Prop()
  district: string;

  @Prop()
  city: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true }) 
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User; 

  @Prop([OrderItemSchema]) 
  items: OrderItem[];

  @Prop({ type: AddressSchema })
  shippingAddress: Address;

  @Prop({ enum: ['COD', 'VNPAY', 'MOMO'], default: 'COD' })
  paymentMethod: string;

  @Prop({ required: true })
  itemsTotal: number;

  @Prop()
  couponCode: string;

  @Prop({ default: 0 })
  couponDiscount: number;

  @Prop({ default: 0 })
  pointsUsed: number;

  @Prop({ default: 0 })
  pointsDiscount: number;

  @Prop({ required: true })
  total: number;

  @Prop({
    enum: [
      'pending', 'confirmed', 'preparing', 'shipping',
      'delivered', 'cancelled', 'cancel_requested', 'refunded',
    ],
    default: 'pending',
  })
  status: string;

  @Prop()
  orderedAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop({ type: String, default: null })
  autoConfirmJobId: string | null;

  @Prop([OrderStatusHistorySchema])
  orderStatusHistory: OrderStatusHistory[];

  @Prop({ default: () => new Date(Date.now() + 30 * 60 * 1000) })
  cancellableUntil: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);