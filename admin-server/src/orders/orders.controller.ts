import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AdminOrderService } from './orders.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ListOrderQueryDto } from './dto/list-orders-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ParseMongoIdPipe } from '../common/pipes/parse-mongo-id.pipe';

@Controller('admin/orders')
@UseGuards(AuthGuard, AdminGuard)
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  @Get()
  async listOrders(@Query(ValidationPipe) query: ListOrderQueryDto) {
    const result = await this.adminOrderService.findAll(query);
    return { success: true, ...result };
  }


  @Get(':id')
  async getOrder(@Param('id', ParseMongoIdPipe) id: string) {
    const order = await this.adminOrderService.findOne(id);
    return { success: true, data: order };
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body(ValidationPipe) dto: UpdateOrderStatusDto,
  ) {
    const updatedOrder = await this.adminOrderService.updateStatus(
      id,
      dto.status,
    );
    return { success: true, order: updatedOrder.toObject() };
  }
}