import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/schemas/user.schema';
import bcrypt from 'node_modules/bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  /**
   * (Dùng cho LocalStrategy)
   * Kiểm tra email và password có hợp lệ không.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    // 1. Tìm user bằng email
    const user = await this.userService.findOneByEmail(email);

    // 2. Nếu tìm thấy user, so sánh mật khẩu
    if (user && (await bcrypt.compare(pass, (user as any).password))) {
      // 3. OK -> trả về user (loại bỏ mật khẩu)
      const { password, ...result } = user.toObject();
      return result;
    }
    
    // 4. Sai -> ném lỗi
    return null; // LocalStrategy sẽ tự bắt lỗi này
  }

  /**
   * (Dùng cho Controller)
   * Tạo JWT sau khi user đã được validate thành công.
   */
  async login(user: User) {
    // **CHECK VAI TRÒ ADMIN**
    // Đây là mấu chốt cho yêu cầu "vai trò admin" của bạn
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Bạn không có quyền truy cập trang Admin.');
    }

    // Payload chứa thông tin sẽ lưu trong token
    const payload = { 
      email: user.email, 
      sub: user._id, // subject (thường là user ID)
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}