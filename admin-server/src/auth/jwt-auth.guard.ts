import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard này dùng để xác thực JWT trong request
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
