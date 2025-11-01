import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class CreatePetDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

export class PetQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    search?: string;
}

export class PetResponseDto {
    _id: string;
    name: string;
    productCount: number;
}