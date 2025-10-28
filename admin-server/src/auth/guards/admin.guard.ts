import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../../user/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    if (!user) {
      throw new UnauthorizedException('Yêu cầu xác thực (Lỗi AdminGuard)');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Không có quyền truy cập (Admin only)');
    }

    return true;
  }
}
