import { IsNumber, IsNotEmpty, Min, IsString, IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export enum InventorySortBy {
  NEWEST = 'createdAt',
  OLDEST = 'createdAt',
  MOST_STOCK = 'stock',
  LEAST_STOCK = 'stock',
  NAME = 'name',
}

export class InventoryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  petId?: string;

  @IsOptional()
  @IsIn(Object.values(InventorySortBy))
  sortBy?: InventorySortBy;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}