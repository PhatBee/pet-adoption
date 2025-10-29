import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSalesController } from './admin-sales.controller';
import { AdminSalesService } from './admin-sales.service';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    AuthModule,
  ],
  controllers: [AdminSalesController],
  providers: [AdminSalesService],
})
export class AdminSalesModule {}