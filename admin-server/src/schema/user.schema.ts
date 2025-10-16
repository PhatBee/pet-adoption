// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

// --- Address Sub-schema ---
// Schema cho địa chỉ được định nghĩa riêng để cho gọn
@Schema({ timestamps: true })
export class Address extends Document {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  street: string;

  @Prop()
  ward: string;

  @Prop()
  district: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: false })
  isDefault: boolean;
}
export const AddressSchema = SchemaFactory.createForClass(Address);


// --- User Schema Chính ---
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  avatarUrl: string;

  @Prop({ default: 'user' })
  role: string;
  
  @Prop({ default: '' })
  phone: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 0, min: 0 })
  loyaltyPoints: number;

  // Nhúng mảng các địa chỉ vào
  @Prop({ type: [AddressSchema] })
  addresses: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);