import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Pet } from './pet.schema'; // Import the type for reference
import { Category } from './category.schema'; // Import the type for reference

@Schema({ timestamps: true })
export class Product extends Document {
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

  @Prop({ default: 0, min: 0 })
  compareAtPrice: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: null })
  thumbnail: string;

  @Prop({ default: 0 })
  stock: number;

  // --- This is the important part for references ---
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category: Category;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Pet', required: true })
  pet: Pet;
  // ------------------------------------------------

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

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add indexes just like in your original file
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ viewCount: -1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ pet: 1 });