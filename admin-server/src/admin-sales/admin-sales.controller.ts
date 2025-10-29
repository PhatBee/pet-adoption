// admin-sales.controller.ts
import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AdminSalesService } from './admin-sales.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { RevenueQueryDto } from './dto/revenue-query.dto';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminSalesController {
  constructor(private readonly adminSalesService: AdminSalesService) {}

  @Get('stats/revenue')
  async getRevenueStats(
    @Query(new ValidationPipe({ transform: true })) query: RevenueQueryDto,
  ) {
    return this.adminSalesService.getRevenueStats(query);
  }
}
