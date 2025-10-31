import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet, Product } from '../product/schemas/product.schema';
import { PetQueryDto, PetResponseDto } from './dto/pet.dto';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class PetService {
  constructor(@InjectModel(Pet.name) private petModel: Model<Pet>,
    @InjectModel(Product.name) private productModel: Model<Product>,) { }

  async create(name: string): Promise<Pet> {
    const exists = await this.petModel.findOne({ name });
    if (exists) {
        throw new ConflictException(`Pet with name "${name}" already exists.`);
    }
    const createdPet = new this.petModel({ name });
    return createdPet.save();
  }

  async findAll(
    query: PetQueryDto,
  ): Promise<PaginatedResult<PetResponseDto>> {
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
        foreignField: 'pet',
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

    const result = await this.petModel.aggregate(facetPipeline);

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
  
  async update(id: string, newName: string): Promise<Pet> {
    const exists = await this.petModel.findOne({ name: newName, _id: { $ne: id } });
    if (exists) {
        throw new ConflictException(`Pet with name "${newName}" already exists.`);
    }
    
    const updatedPet = await this.petModel
      .findByIdAndUpdate(id, { name: newName }, { new: true })
      .exec();
    
    if (!updatedPet) {
        throw new NotFoundException(`Pet with ID "${id}" not found`);
    }
    return updatedPet;
  }

  async remove(id: string): Promise<any> {
    const productCount = await this.productModel.countDocuments({ pet: id });
    if (productCount > 0) {
      throw new ConflictException(`Không thể xóa "${id}".`);
    }

    const result = await this.petModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Pet with ID "${id}" not found`);
    }
    return { message: 'Pet deleted successfully' };
  }
}