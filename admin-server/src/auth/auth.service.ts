import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RefreshToken } from '../schema/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async validateAdmin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.role !== 'admin') {
      throw new UnauthorizedException('Không có quyền truy cập');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    return user;
  }

  // ---- Đăng nhập: tạo cả access và refresh token ----
  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET',
      expiresIn: '1d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET',
      expiresIn: '7d',
    });

    // Lưu refresh token vào DB
    await this.refreshTokenModel.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ---- Làm mới Access Token ----
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không có refresh token');
    }

    const dbToken = await this.refreshTokenModel.findOne({ token: refreshToken });
    if (!dbToken) {
      throw new ForbiddenException('Refresh token không hợp lệ hoặc đã bị logout');
    }

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET',
      });

      const newAccessToken = this.jwtService.sign(
        {
          sub: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'ACCESS_SECRET',
          expiresIn: '1d',
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new ForbiddenException('Refresh token không hợp lệ hoặc hết hạn');
    }
  }

  // ---- Logout: xóa refresh token ----
  async logout(refreshToken: string) {
    if (refreshToken) {
      await this.refreshTokenModel.deleteOne({ token: refreshToken });
    }
    return { message: 'Đăng xuất thành công' };
  }
}
