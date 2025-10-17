// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // Giả sử bạn có UsersService
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Kiểm tra thông tin đăng nhập của người dùng.
   * @param email Email người dùng nhập
   * @param pass Mật khẩu người dùng nhập
   * @returns Thông tin user nếu hợp lệ, nếu không trả về null
   */
  async validateAdmin(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    // Kiểm tra 3 điều kiện:
    // 1. User có tồn tại không?
    // 2. Mật khẩu có đúng không? (dùng bcrypt để so sánh)
    // 3. User có phải là 'admin' không?
    if (user && (await bcrypt.compare(pass, user.password)) && user.role === 'admin') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject(); // Loại bỏ password khỏi kết quả trả về
      return result;
    }
    
    // Nếu một trong 3 điều kiện trên sai, trả về null
    return null;
  }

  /**
   * Tạo JWT Access Token sau khi xác thực thành công.
   * @param user Thông tin user đã được xác thực
   * @returns Đối tượng chứa access_token
   */
  async login(user: any) {
    // Dữ liệu sẽ được mã hóa vào trong token
    // Không bao giờ đưa mật khẩu hay các thông tin nhạy cảm vào đây
    const payload = { email: user.email, sub: user._id, role: user.role };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}