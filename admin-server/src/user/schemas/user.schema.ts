import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcrypt';

// Định nghĩa Address Schema lồng ghép
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


// Định nghĩa User Schema chính
@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatarUrl: string;

  @Prop({ default: 'user' })
  role: string; // Sẽ dùng trường này để check admin

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop({ type: Number, default: 0, min: 0 })
  loyaltyPoints: number;

  // Method để so sánh mật khẩu (sẽ dùng trong auth.service)
  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// TỰ ĐỘNG HASH MẬT KHẨU TRƯỚC KHI LƯU (Rất quan trọng)
UserSchema.pre<User>('save', async function (next) {
  // Chỉ hash nếu mật khẩu bị thay đổi (hoặc là user mới)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});