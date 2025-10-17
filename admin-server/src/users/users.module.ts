// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; 
import { User, UserSchema } from '../schema/user.schema';

@Module({
  imports: [
    // 1. Kết nối schema User với Mongoose
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  // controllers: [UsersController],
  providers: [UsersService],
  // 2. EXPORT UsersService để các module khác có thể sử dụng
  exports: [UsersService], 
})
export class UsersModule {}