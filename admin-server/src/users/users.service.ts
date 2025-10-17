// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Tìm kiếm một người dùng duy nhất dựa trên email.
   * Hàm này rất quan trọng cho chức năng đăng nhập.
   * @param email Email cần tìm
   * @returns Document của User hoặc null nếu không tìm thấy
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

}