import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pet } from '../product/schemas/product.schema';

@Injectable()
export class PetService {
  constructor(@InjectModel(Pet.name) private petModel: Model<Pet>) {}

  async create(name: string): Promise<Pet> {
    const exists = await this.petModel.findOne({ name });
    if (exists) {
        throw new ConflictException(`Pet with name "${name}" already exists.`);
    }
    const createdPet = new this.petModel({ name });
    return createdPet.save();
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.find().exec();
  }
  
  async update(id: string, newName: string): Promise<Pet> {
    // 💡 Đảm bảo tên mới chưa tồn tại
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
    // ⚠️ Cần kiểm tra xem có Product nào đang tham chiếu đến Pet này trước khi xóa cứng!
    const result = await this.petModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
        throw new NotFoundException(`Pet with ID "${id}" not found`);
    }
    return { message: 'Pet deleted successfully' };
  }
}