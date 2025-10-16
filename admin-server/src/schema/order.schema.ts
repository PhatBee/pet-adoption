// src/orders/schemas/order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Product } from './product.schema';

// --- OrderStatusHistory Sub-schema ---
@Schema({ _id: false })
export class OrderStatusHistory extends Document {
  @Prop({ required: true })
  status: string;

  @Prop({ default: Date.now })
  changedAt: Date;
}
export const OrderStatusHistorySchema = SchemaFactory.createForClass(OrderStatusHistory);


// --- OrderItem Sub-schema ---
@Schema({ _id: false })
export class OrderItem extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: Object, required: true })
  productSnapshot: object;

  @Prop({ required: true })
  quantity: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);


// --- ShippingAddress Sub-schema (tương tự AddressSchema trong User) ---
@Schema({ _id: false })
export class ShippingAddress extends Document {
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
export const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: [OrderItemSchema] })
  items: OrderItem[];

  @Prop({ type: ShippingAddressSchema })
  shippingAddress: ShippingAddress;

  @Prop({ enum: ['COD', 'VNPAY'], default: 'COD' })
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
    default: 'pending', 
    enum: ["pending","confirmed", "preparing","shipping", "delivered","cancelled","cancel_requested","refunded"] 
  })
  status: string;

  @Prop()
  orderedAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop({ default: null })
  autoConfirmJobId: string;

  @Prop({ type: [OrderStatusHistorySchema] })
  orderStatusHistory: OrderStatusHistory[];
  
  @Prop({ default: () => new Date(Date.now() + 30 * 60 * 1000) })
  cancellableUntil: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);