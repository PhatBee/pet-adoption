import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Tìm user theo email, và lấy cả mật khẩu (select: '+password')
  // Mặc định password nên được ẩn, nhưng khi login thì ta cần nó
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  // (Bạn sẽ thêm các hàm khác ở đây, ví dụ: create, findById, ...)
}