import { Controller, Post, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('admin/login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user as any);
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    try {
      const authHeader = req.headers.authorization;
      const oldToken = authHeader?.split(' ')[1];
      if (!oldToken) throw new Error('Missing token');

      const decoded = this.jwtService.verify(oldToken, {
        secret: process.env.JWT_ACCESS_SECRET,
        ignoreExpiration: true,
      });

      const newToken = this.jwtService.sign({
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      });

      return { access_token: newToken };
    } catch (err) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}
