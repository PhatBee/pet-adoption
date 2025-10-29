import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios'; // 1. Import HttpService
import { ConfigService } from '@nestjs/config'; // 2. Import ConfigService
import { firstValueFrom } from 'rxjs'; // 3. Import firstValueFrom
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
    private readonly httpService: HttpService, // 4. Inject HttpService
    private readonly configService: ConfigService, // 5. Inject ConfigService
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
    let updatedOrder: OrderDocument | null = null; // Biến để lưu đơn hàng đã cập nhật
    try {
      const order = await this.orderModel.findById(orderId).session(session).populate('user', 'email name');
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

      updatedOrder = await order.save({ session }); // Lưu lại đơn hàng đã cập nhật
      await session.commitTransaction();

      // --- 6. GỌI API THÔNG BÁO (Sau khi commit thành công) ---
      if (updatedOrder && updatedOrder.user) {
        // Lấy thông tin user từ order đã populate
        const user = updatedOrder.user as any; // Cast để truy cập email, name

        // Tạo nội dung thông báo dựa trên trạng thái mới
        const notificationPayload = {
            userId: user._id.toString(),
            title: `Đơn hàng #${orderId.toString().slice(-6)} đã cập nhật`,
            message: `Trạng thái đơn hàng của bạn đã được cập nhật thành: ${this.translateStatus(toStatus)}.`,
            link: `/orders/${orderId}`,
            type: 'order'
        };

        // Gọi API nội bộ trên Backend User
        await this.sendNotificationToUserBackend(notificationPayload);
      }
      // --------------------------------------------------------

      return updatedOrder;
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

  // --- 7. HÀM GỬI THÔNG BÁO ---
  private async sendNotificationToUserBackend(payload: { userId: string; title: string; message: string; link?: string; type?: string }) {
      const userBackendUrl = this.configService.get<string>('USER_BACKEND_URL');
      const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');

      if (!userBackendUrl || !internalApiKey) {
          console.error("USER_BACKEND_URL or INTERNAL_API_KEY is not configured in .env");
          return;
      }

      const notificationUrl = `${userBackendUrl}/api/internal/notifications`;

      try {
          console.log(`Sending notification to ${notificationUrl} for user ${payload.userId}`);
          const response = await firstValueFrom( // Dùng firstValueFrom để chuyển Observable thành Promise
              this.httpService.post(notificationUrl, payload, {
                  headers: {
                      'Content-Type': 'application/json',
                      'x-internal-api-key': internalApiKey,
                  },
              })
          );
          console.log(`Notification API response status: ${response.status}`);
      } catch (error) {
          // Log lỗi chi tiết hơn
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
          const errorStatus = error.response?.status || 'N/A';
          console.error(`Failed to send notification via internal API. Status: ${errorStatus}, Error: ${errorMessage}`, error.response?.data);
          // Không nên throw lỗi ở đây để tránh làm hỏng luồng cập nhật status chính
      }
  }

  // --- 8. HÀM DỊCH STATUS (Tùy chọn) ---
    private translateStatus(status: string): string {
        const statusMap: Record<string, string> = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            preparing: 'Đang chuẩn bị hàng',
            shipping: 'Đang giao hàng',
            delivered: 'Đã giao hàng',
            cancelled: 'Đã hủy',
            cancel_requested: 'Yêu cầu hủy',
            refunded: 'Đã hoàn tiền',
        };
        return statusMap[status] || status;
    }
}