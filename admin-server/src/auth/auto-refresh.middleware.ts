// src/auth/auto-refresh.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Injectable()
export class AutoRefreshMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = (req.headers.authorization as string) || '';
      const accessToken = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

      // Nếu có access token -> thử verify
      if (accessToken) {
        try {
          // verify access token (sử dụng secret access)
          const payload = this.jwtService.verify(accessToken, {
            secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET',
            ignoreExpiration: false,
          });
          // gắn user payload vào request
          (req as any).user = {
            userId: payload.sub,
            email: payload.email,
            role: payload.role,
          };
          return next();
        } catch (err: any) {
          // Nếu lỗi không phải do token hết hạn => ném lỗi tiếp
          // TokenExpiredError có name === 'TokenExpiredError'
          if (err.name !== 'TokenExpiredError') {
            // token invalid (tampered) -> unauthorized
            throw new UnauthorizedException('Access token không hợp lệ');
          }
          // nếu expired -> tiếp tục xuống phần refresh
        }
      }

      // Nếu không có access token hoặc access token hết hạn -> thử dùng refresh token từ cookie
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header('x-refresh-token');
      if (!refreshToken) {
        // Không có refresh token -> 401
        throw new UnauthorizedException('Thiếu refresh token');
      }

      // Gọi AuthService.refresh để tạo access token mới
      // AuthService.refresh sẽ verify refresh token, kiểm tra DB, và trả { accessToken }
      const result = await this.authService.refresh(refreshToken);

      if (!result || !result.accessToken) {
        throw new UnauthorizedException('Không thể làm mới access token');
      }

      const newAccessToken = result.accessToken;

      // Đặt header trả về để client nhận token mới (client có thể lưu lại)
      // Bạn có thể đổi sang đặt cookie nếu muốn
      res.setHeader('x-access-token', newAccessToken);
      // Optionally also set Authorization header for downstream services / debugging
      res.setHeader('authorization', `Bearer ${newAccessToken}`);

      // Verify mới để lấy payload và gắn vào req.user
      const newPayload = this.jwtService.verify(newAccessToken, {
        secret: process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET',
      });

      (req as any).user = {
        userId: newPayload.sub,
        email: newPayload.email,
        role: newPayload.role,
      };

      return next();
    } catch (error) {
      // Nếu middleware dùng cho route bảo vệ, trả 401 hoặc forward lỗi để guard bắt
      // Ở đây mình trả 401 để giống hành vi middleware xác thực
      const status = (error && error.status) || 401;
      return res.status(status).json({
        message: error?.message || 'Unauthorized',
      });
    }
  }
}
