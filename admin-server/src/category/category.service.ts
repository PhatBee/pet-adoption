import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, Product } from '../product/schemas/product.schema';
import { CategoryQueryDto, CategoryResponseDto } from './dto/category.dto';
import { PaginatedResult } from 'src/common/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(name: string): Promise<Category> {
    const exists = await this.categoryModel.findOne({ name });
    if (exists) {
        throw new ConflictException(`Category with name "${name}" already exists.`);
    }
    const createdCategory = new this.categoryModel({ name });
    return createdCategory.save();
  }

  async findAll(
    query: CategoryQueryDto,
  ): Promise<PaginatedResult<CategoryResponseDto>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const pipeline: any[] = [];

    if (search) {
      pipeline.push({
        $match: { name: { $regex: search, $options: 'i' } },
      });
    }

    pipeline.push({
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
      },
    });

    pipeline.push({
      $addFields: {
        productCount: { $size: '$products' },
      },
    });

    pipeline.push({
      $project: {
        name: 1,
        productCount: 1,
      },
    });

    const facetPipeline = [
      ...pipeline,
      {
        $facet: {
          data: [{ $sort: { name: 1 } }, { $skip: skip }, { $limit: limit }],
          totalItems: [{ $count: 'count' }],
        },
      },
    ];

    const result = await this.categoryModel.aggregate(facetPipeline);

    const data = result[0].data;
    const totalItems = result[0].totalItems[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      totalItems,
      totalPages,
      currentPage: page,
    };
  }
  
  async update(id: string, newName: string): Promise<Category> {
    const exists = await this.categoryModel.findOne({ name: newName, _id: { $ne: id } });
    if (exists) {
        throw new ConflictException(`Category with name "${newName}" already exists.`);
    }
    
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, { name: newName }, { new: true })
      .exec();
    
    if (!updatedCategory) {
        throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return updatedCategory;
  }
  
  async remove(id: string): Promise<any> {
    const productCount = await this.productModel.countDocuments({ category: id });
    if (productCount > 0) {
        throw new ConflictException(`Cannot delete Category ID "${id}". ${productCount} product(s) are still using it.`);
    }
    
    const result = await this.categoryModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
        throw new NotFoundException(`Category with ID "${id}" not found`);
    }
    return { message: 'Category deleted successfully' };
  }
}