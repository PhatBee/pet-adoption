// src/auth/strategies/local.strategy.ts
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Cấu hình cho passport-local strategy
    super({
      usernameField: 'email', // Báo cho Passport biết trường username trong request body là 'email'
      passwordField: 'password', // Trường password vẫn là 'password'
    });
  }

  /**
   * Passport sẽ tự động gọi hàm này với email và password từ request body.
   * Nhiệm vụ của chúng ta là gọi service để kiểm tra thông tin này.
   * @param email Email mà người dùng gửi lên
   * @param password Mật khẩu mà người dùng gửi lên
   * @returns Trả về user object nếu xác thực thành công
   * @throws UnauthorizedException nếu xác thực thất bại
   */
  async validate(email: string, password: string): Promise<any> {
    console.log(`Attempting to validate admin: ${email}`); // Thêm log để debug
    
    const user = await this.authService.validateAdmin(email, password);
    
    if (!user) {
      // Nếu service trả về null, nghĩa là xác thực thất bại
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng, hoặc bạn không phải Admin.');
    }
    
    // Nếu thành công, Passport sẽ gắn user này vào request (req.user)
    return user;
  }
}