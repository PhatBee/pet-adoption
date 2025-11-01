import { Controller, Post, Body, Get, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '../product/schemas/product.schema';
import { CreateCategoryDto, CategoryQueryDto, CategoryResponseDto } from './dto/category.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaginatedResult } from 'src/common/dto/pagination.dto';

@Controller('admin/categories')
@UseGuards(AuthGuard, AdminGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createDto.name);
  }

  @Get()
  findAll(
    @Query() query: CategoryQueryDto,
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    return this.categoryService.findAll(query);
  }

  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string, 
    @Body() updateDto: CreateCategoryDto
  ): Promise<Category> {
    return this.categoryService.update(id, updateDto.name);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string): Promise<any> {
    return this.categoryService.remove(id);
  }
}