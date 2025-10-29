import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Order, OrderDocument, OrderItem } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { ListOrderQueryDto } from './dto/list-orders-query.dto';
import { isAllowedTransition } from '../utils/orderTransitions';

@Injectable()
export class AdminOrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findAll(queryDto: ListOrderQueryDto) {
    const { page = 1, limit = 20, status, q } = queryDto;
    const skip = (page - 1) * limit;

    const filter: mongoose.FilterQuery<OrderDocument> = {};

    if (status) {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: q, $options: 'i' } },
      ];
    }

    try {
      const [orders, total] = await Promise.all([
        this.orderModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        this.orderModel.countDocuments(filter),
      ]);

      return { data: orders, meta: { page, limit, total } };
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
  }

  async findOne(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('items.product')
      .lean();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async updateStatus(orderId: string, toStatus: string) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const order = await this.orderModel.findById(orderId).session(session);
      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng');
      }

      const fromStatus = order.status;
      if (fromStatus === toStatus) {
        return order;
      }

      if (!isAllowedTransition(fromStatus, toStatus)) {
        throw new BadRequestException(
          `Không thể chuyển từ ${fromStatus} sang ${toStatus}`,
        );
      }

      if (toStatus === 'cancelled') {
        if (['pending', 'confirmed', 'preparing'].includes(fromStatus)) {
          await this.restockItems(order.items, session);
        }
      }

      if (toStatus === 'delivered') {
        order.deliveredAt = new Date();
      }

      order.status = toStatus;
      order.orderStatusHistory.push({
        status: toStatus,
        changedAt: new Date(),
      });

      if (order.autoConfirmJobId && ['confirmed', 'cancelled'].includes(toStatus)) {
        order.autoConfirmJobId = null;
      }

      await order.save({ session });
      await session.commitTransaction();

      return order;
    } catch (err) {
      await session.abortTransaction();
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(err.message);
    } finally {
      session.endSession();
    }
  }

  private async restockItems(
    items: OrderItem[],
    session: mongoose.ClientSession,
  ) {
    for (const it of items) {
      await this.productModel.updateOne(
        { _id: it.product },
        { $inc: { stock: it.quantity } },
        { session },
      );
    }
  }
}