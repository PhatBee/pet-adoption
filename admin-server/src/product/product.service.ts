import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument, Category, Pet } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import slugify from 'slugify';
import { ProductQueryDto } from './dto/product-query.dto';

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Pet.name) private petModel: Model<Pet>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productModel.findOne({ name: createProductDto.name });
    if (existingProduct) {
      throw new BadRequestException('Product name already exists');
    }

    const newSlug = slugify(createProductDto.name, { lower: true, strict: true });

    const categoryExists = await this.categoryModel.findById(createProductDto.category);
    const petExists = await this.petModel.findById(createProductDto.pet);

    if (!categoryExists || !petExists) {
      throw new NotFoundException('Category or Pet not found.');
    }

    const createdProduct = new this.productModel({
      ...createProductDto,
      slug: newSlug,
    });
    return createdProduct.save();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findById(id)
      .populate('category')
      .populate('pet')
      .exec();

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedResult<Product>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (query.categoryId) {
        filter.category = query.categoryId;
    }
    if (query.petId) {
        filter.pet = query.petId;
    }
    
    if (query.search) {
        const searchRegex = new RegExp(query.search, 'i');
        filter.$or = [
            { name: searchRegex },
            { shortDescription: searchRegex },
            { slug: searchRegex },
        ];
    }
    const totalItems = await this.productModel.countDocuments(filter).exec();

    const products = await this.productModel
      .find(filter)
      .populate('category') 
      .populate('pet')      
      .skip(skip) 
      .limit(limit) 
      .sort({ createdAt: -1 })
      .exec();

    return {
      data: products,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const updatePayload: any = { ...updateProductDto };

    if (updateProductDto.name) {
      updatePayload.slug = slugify(updateProductDto.name, { lower: true, strict: true });
    }

    if (updateProductDto.category) {
      const categoryExists = await this.categoryModel.findById(updateProductDto.category);
      if (!categoryExists) {
        throw new BadRequestException(`Category ID "${updateProductDto.category}" not found.`);
      }
    }
    if (updateProductDto.pet) {
      const petExists = await this.petModel.findById(updateProductDto.pet);
      if (!petExists) {
        throw new BadRequestException(`Pet ID "${updateProductDto.pet}" not found.`);
      }
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('category')
      .populate('pet')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return updatedProduct;
  }

  async enable(id: string): Promise<Product> {
    const enabledProduct = await this.productModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!enabledProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return enabledProduct;
  }

  async disable(id: string): Promise<Product> {
    const disabledProduct = await this.productModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    
    if (!disabledProduct) {
        throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return disabledProduct;
  }
}