import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString, IsNumber, Min, IsArray, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean; 
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;
}