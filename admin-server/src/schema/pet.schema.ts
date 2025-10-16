import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Pet extends Document {
  @Prop({ required: true, unique: true })
  name: string;
}

export const PetSchema = SchemaFactory.createForClass(Pet);