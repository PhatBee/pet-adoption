import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('admin/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    async findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

}
