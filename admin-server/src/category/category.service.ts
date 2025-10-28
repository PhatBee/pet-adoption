import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../product/schemas/product.schema';
import { Product } from '../product/schemas/product.schema'; 

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

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
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