import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number = 0;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[] = [];

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number = 0;

  @IsNotEmpty()
  @IsString()
  category: Types.ObjectId; 

  @IsNotEmpty()
  @IsString()
  pet: Types.ObjectId; 

  @IsOptional()
  @IsString()
  brand?: string;
}