import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ---- Login ----
  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Res() res: Response) {
    const result = await this.authService.validateAdmin(body.email, body.password);
    const tokens = await this.authService.login(result);

    // Gắn refresh token vào cookie (bảo mật hơn)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false, // true nếu deploy HTTPS
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.json({
      accessToken: tokens.accessToken,
      user: tokens.user,
    });
  }

  // ---- Refresh ----
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string, @Res() res: Response) {
    const newToken = await this.authService.refresh(refreshToken);
    return res.json(newToken);
  }

  // ---- Logout ----
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string, @Res() res: Response) {
    await this.authService.logout(refreshToken);

    // Xóa cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });

    return res.json({ message: 'Đăng xuất thành công' });
  }
}
