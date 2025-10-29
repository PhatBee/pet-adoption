import { Controller, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';
import { UserQueryDto, PaginatedUserResult, UserDetailDto } from './dto/user-query.dto';

@UseGuards(AuthGuard, AdminGuard)
@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(
    @Query() queryDto: UserQueryDto,
  ): Promise<PaginatedUserResult<User>> {
    return this.userService.findAllUsers(queryDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseMongoIdPipe) id: string,
  ): Promise<UserDetailDto> {
    return this.userService.findOneById(id);
  }


  @Patch(':id/disable')
  async disable(
    @Param('id', ParseMongoIdPipe) id: string,
  ): Promise<User> {
    return this.userService.disableUser(id);
  }

  @Patch(':id/enable')
  async enable(
    @Param('id', ParseMongoIdPipe) id: string,
  ): Promise<User> {
    return this.userService.enableUser(id);
  }
}