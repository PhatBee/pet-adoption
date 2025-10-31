import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { InventoryService } from './inventory.service';
import { inventoryController } from './inventory.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [inventoryController],
  providers: [InventoryService],
  exports: [InventoryService], 
})
export class InventoryModule {}