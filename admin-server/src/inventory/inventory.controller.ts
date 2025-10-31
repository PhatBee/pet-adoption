// warehouse.controller.ts

import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { UpdateStockDto, InventoryQueryDto } from './dto/inventory.dto';

@Controller('admin/inventory')
export class inventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAllProducts(query);
  }

  @Patch(':id/stock-in')
  updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return this.inventoryService.updateStock(id, updateStockDto);
  }
}