import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth') // Prefix: /api/auth
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint: POST /api/auth/admin/login
   * @UseGuards('local') sẽ tự động gọi LocalStrategy
   */
  @UseGuards(AuthGuard('local'))
  @Post('admin/login')
  async login(@Request() req) {
    // req.user sẽ là object user được trả về từ LocalStrategy.validate()
    // Service.login sẽ check role admin và tạo token
    return this.authService.login(req.user);
  }
}