import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreateCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class CategoryQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    search?: string;
}

export class CategoryResponseDto {
    _id: string;
    name: string;
    productCount: number;
}