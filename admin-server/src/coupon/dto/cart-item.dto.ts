import { IsNotEmpty, IsMongoId, IsNumber, Min } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

export class CartItemDto {
  @IsMongoId()
  productId: MongooseSchema.Types.ObjectId;

  @IsMongoId()
  categoryId: MongooseSchema.Types.ObjectId; 

  @IsMongoId()
  petTypeId: MongooseSchema.Types.ObjectId;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}