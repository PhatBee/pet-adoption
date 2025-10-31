// warehouse.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { InventoryQueryDto, UpdateStockDto, InventorySortBy } from './dto/inventory.dto';
import { PaginatedResult } from '../product/product.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAllProducts(
    query: InventoryQueryDto,
  ): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10, search, categoryId, petId, sortBy, sortOrder } = query;

    const filter: FilterQuery<ProductDocument> = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (categoryId) {
      filter.category = categoryId;
    }
    if (petId) {
      filter.pet = petId;
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
        let order = 1;
        if (sortOrder) {
            order = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === InventorySortBy.NEWEST || sortBy === InventorySortBy.MOST_STOCK) {
            order = -1; 
        }

        const sortField = sortBy.includes('stock') ? 'stock' : sortBy;
        sort[sortField] = order as 1 | -1;
    } else {
        sort.name = 1; 
    }

    filter.isActive = true; 
    
    const skip = (page - 1) * limit;
    const totalItems = await this.productModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const data = await this.productModel
      .find(filter)
      .populate('category', 'name')
      .populate('pet', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: data as Product[],
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async updateStock(productId: string, updateStockDto: UpdateStockDto): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      { 
        $inc: { stock: updateStockDto.quantity },
      },
      { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Không tìm thấy sản phẩm có ID: ${productId}`);
    }

    return updatedProduct as Product;
  }
}