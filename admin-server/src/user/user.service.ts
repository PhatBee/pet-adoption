  import { Injectable, NotFoundException } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, SortOrder, Types } from 'mongoose';
  import { User } from './schemas/user.schema';
  import { UserQueryDto, PaginatedUserResult } from './dto/user-query.dto';
  import { Order } from '../orders/schemas/order.schema';
  import { UserDetailDto } from './dto/user-query.dto';

  @Injectable()
  export class UserService {
    constructor(
      @InjectModel(User.name) private userModel: Model<User>,
      @InjectModel(Order.name) private orderModel: Model<Order>,) {}

    async findOneByEmail(email: string): Promise<User | null> {
      return this.userModel.findOne({ email }).select('+password').exec();
    }

    async findAllUsers(queryDto: UserQueryDto): Promise<PaginatedUserResult<User>> {
      const { page = 1, limit = 10, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

      const skip = (page - 1) * limit;
      const filter: any = { role: 'user' };

      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      const sort: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [totalItems, users] = await Promise.all([
        this.userModel.countDocuments(filter).exec(),
        this.userModel
          .find(filter)
          .select('-password')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .exec(),
      ]);

      return {
        data: users,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      };
    }

    private async calculateTotalOrders(userId: string): Promise<number> {
      try {
        return await this.orderModel.countDocuments({ user: new Types.ObjectId(userId) });
      } catch (error) {
        console.error(`Error counting orders for user ${userId}:`, error);
        return 0;
      }
    }

    private async calculateTotalSpend(userId: string): Promise<number> {
      try {
        const result = await this.orderModel.aggregate([
          { $match: { user: new Types.ObjectId(userId) } },
          // { $match: { status: 'delivered' } },
          { $group: { _id: null, totalSpend: { $sum: '$total' } } },
        ]);

        return result.length > 0 ? result[0].totalSpend : 0;
      } catch (error) {
        console.error(`Error calculating total spend for user ${userId}:`, error);
        return 0;
      }
    }

    async findOneById(id: string): Promise<UserDetailDto> {
      const user = await this.userModel
        .findById(id)
        .select('-password')
        .lean<{ _id: Types.ObjectId } & User & { createdAt: Date; updatedAt: Date }>()
        .exec();

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}.`);
      }

      const [totalOrders, totalSpend] = await Promise.all([
        this.calculateTotalOrders(id),
        this.calculateTotalSpend(id),
      ]);

      return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      isActive: user.isActive,
      addresses: user.addresses,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalOrders,
      totalSpend,
    };
    }

    async disableUser(id: string): Promise<User> {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng ${id}.`);
      }
      return user;
    }

    async enableUser(id: string): Promise<User> {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true },
      );

      if (!user) {
        throw new NotFoundException(`Không tìm thấy người dùng ${id}.`);
      }
      return user;
    }

  }