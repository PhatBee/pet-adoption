// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module'; // Sẽ tạo ở bước sau
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    // 1. Import UsersModule để AuthService có thể sử dụng UsersService
    UsersModule, 
    
    // 2. Đăng ký PassportModule
    PassportModule,
    
    // 3. Cấu hình và đăng ký JwtModule
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET, // ⚠️ THAY BẰNG KHÓA BÍ MẬT CỦA BẠN
      signOptions: { expiresIn: '7d' }, // Cấu hình token hết hạn sau 1 ngày
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    LocalStrategy, // 4. Khai báo LocalStrategy là một provider
  ],
  exports: [AuthService], // Xuất AuthService để có thể dùng ở các module khác nếu cần
})
export class AuthModule {}