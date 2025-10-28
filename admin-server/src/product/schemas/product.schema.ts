import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

// --- 1. Pet Model ---
export type PetDocument = Pet & Document;

@Schema()
export class Pet {
  @Prop({ required: true, unique: true })
  name: string;
}

export const PetSchema = SchemaFactory.createForClass(Pet);

// --- 2. Category Model ---
export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ required: true })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  shortDescription: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: Number, default: 0, min: 0 })
  compareAtPrice: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: null })
  thumbnail: string;

  @Prop({ default: 0 })
  stock: number;

  // --- 💡 Phần Tham Chiếu (Reference) ---
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true })
  category: Category;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true })
  pet: Pet;
  @Prop()
  brand: string;

  @Prop()
  manufacturer: string;

  @Prop()
  country: string;

  @Prop()
  itemWeight: string;

  @Prop()
  dimensions: string;

  @Prop({ default: 0, min: 0 })
  soldCount: number;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ pet: 1 });