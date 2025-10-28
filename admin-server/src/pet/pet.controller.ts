import { Controller, Post, Body, Get, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PetService } from './pet.service';
import { Pet } from '../product/schemas/product.schema';
import { IsString, IsNotEmpty } from 'class-validator';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

class SimpleCreateDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

@Controller('admin/pets')
@UseGuards(AuthGuard, AdminGuard)
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Post()
  create(@Body() createDto: SimpleCreateDto): Promise<Pet> {
    return this.petService.create(createDto.name);
  }

  @Get()
  findAll(): Promise<Pet[]> {
    return this.petService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateDto: SimpleCreateDto
  ): Promise<Pet> {
    return this.petService.update(id, updateDto.name);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string): Promise<any> {
    return this.petService.remove(id);
  }
}