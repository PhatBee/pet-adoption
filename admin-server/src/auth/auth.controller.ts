// src/auth/auth.controller.ts
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard'; // Sẽ tạo ở bước sau

@Controller('auth') // Định nghĩa route cơ sở là /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Định nghĩa API endpoint cho việc đăng nhập
   * POST /auth/login
   */
  @UseGuards(LocalAuthGuard) // Sử dụng Guard để xác thực trước khi vào hàm
  @Post('login')
  async login(@Request() req) {
    // Nếu request vượt qua được LocalAuthGuard, nghĩa là email/password đã hợp lệ
    // Passport sẽ tự động gán object 'user' vào trong request
    // Bây giờ chỉ cần gọi service để tạo token
    return this.authService.login(req.user);
  }
}