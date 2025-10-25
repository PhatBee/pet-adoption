// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy as JwtPassportStrategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types/jwt-payload.interface'; // optional: tạo interface
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtPassportStrategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService, // nếu bạn muốn load user trong validate
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'DEFAULT_SECRET',
    });
  }

  // payload là dữ liệu bạn sign khi login (ví dụ { sub, email, role })
  async validate(payload: JwtPayload) {
    // Tùy chọn: kiểm tra user có tồn tại trong DB không
    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Token không hợp lệ (user không tồn tại)');
    }

    // Trả về thông tin user sẽ được gắn vào `req.user`
    // Lưu ý loại bỏ password nếu cần
    const { password, ...rest } = (user as any).toObject ? (user as any).toObject() : (user as any);
    return rest;
  }
}
