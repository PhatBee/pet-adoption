import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from '../schema/order.schema';
import { Model } from 'mongoose';

@Injectable()
export class OrdersService {
    constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

    async findAll(query: any): Promise<{ data: Order[], meta: any }> {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // 1. Xây dựng đối tượng filter động, giống hệt file Express cũ
    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.q) {
      filter.$or = [
        { "shippingAddress.fullName": { $regex: query.q, $options: "i" } },
        { "shippingAddress.phone": { $regex: query.q, $options: "i" } },
      ];
    }

    // 2. Chạy 2 câu lệnh truy vấn song song để lấy dữ liệu và tổng số lượng
    const [data, total] = await Promise.all([
      this.orderModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // .lean() để trả về plain JS object cho nhanh
        .exec()
        .then(res => res as unknown as Order[]),
      this.orderModel.countDocuments(filter),
    ]);
    
    // 3. Trả về dữ liệu theo cấu trúc { data, meta }
    return {
      data,
      meta: { page, limit, total },
    };
  }
}
