import { Controller, Post, Body, Get, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PetService } from './pet.service';
import { Pet } from '../product/schemas/product.schema';
import { CreatePetDto, PetQueryDto, PetResponseDto } from './dto/pet.dto';
import { IsString, IsNotEmpty } from 'class-validator';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Controller('admin/pets')
@UseGuards(AuthGuard, AdminGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  create(@Body() createDto: CreatePetDto): Promise<Pet> {
    return this.petService.create(createDto.name);
  }

  @Get()
  findAll(
    @Query() query: PetQueryDto
  ): Promise<PaginatedResult<PetResponseDto>> {
    return this.petService.findAll(query);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateDto: CreatePetDto 
  ): Promise<Pet> {
    return this.petService.update(id, updateDto.name);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string): Promise<any> {
    return this.petService.remove(id);
  }
}