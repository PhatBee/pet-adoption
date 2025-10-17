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
  async findOneByEmail(email: string): Promise<User | undefined> {
    // Dùng Mongoose để tìm user có email trùng khớp trong database
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    return user || undefined;
  }

}