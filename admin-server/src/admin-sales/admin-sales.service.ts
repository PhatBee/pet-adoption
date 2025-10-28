// admin-sales.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { RevenueQueryDto } from './dto/revenue-query.dto';

@Injectable()
export class AdminSalesService {
  constructor(@InjectModel(Order.name) private orderModel: Model<OrderDocument>) {}

  async getRevenueStats(query: RevenueQueryDto) {
    const { view = 'month', startDate, endDate } = query;

    // Nếu có range, ưu tiên theo khoảng ngày
    if (startDate && endDate) {
      return this.getRevenueByRange(startDate, endDate);
    }

    if (view === 'week') return this.getRevenueByWeek();
    return this.getRevenueByMonth();
  }

  private async getRevenueByRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          status: 'delivered',
          deliveredAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$deliveredAt' },
            month: { $month: '$deliveredAt' },
            day: { $dayOfMonth: '$deliveredAt' },
          },
          revenue: { $sum: '$total' },
        },
      },
      // { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const revenueMap = new Map<string, number>();
    orders.forEach((order) => {
      const year = order._id.year;
      const month = order._id.month.toString().padStart(2, '0');
      const day = order._id.day.toString().padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      revenueMap.set(dateKey, order.revenue);
    });

    const results: { label: string; revenue: number }[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const label = `${day}/${month}`;

      const revenue = revenueMap.get(dateKey) || 0;

      results.push({ label, revenue });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 4. Trả về mảng kết quả đầy đủ
    return results;
  }

private async getRevenueByWeek(): Promise<{ label: string; revenue: number }[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          status: 'delivered',
          deliveredAt: { $gte: sevenDaysAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$deliveredAt' },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dayLabels: { label: string; dayOfWeek: number; revenue: number }[] = [];
    const dayMap = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayName = dayMap[d.getDay()];
      const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      dayLabels.push({
        label: `${dayName} (${dateLabel})`,
        dayOfWeek: d.getDay() + 1,
        revenue: 0,
      });
    }

    orders.forEach((order) => {
      const dayData = dayLabels.find((d) => d.dayOfWeek === order._id);
      if (dayData) {
        dayData.revenue = order.revenue;
      }
    });

    return dayLabels.map(({ label, revenue }) => ({ label, revenue }));
  }

  private async getRevenueByMonth(): Promise<{ label: string; revenue: number }[]> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const orders = await this.orderModel.aggregate([
      {
        $match: {
          status: 'delivered',
          deliveredAt: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: '$deliveredAt' },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const daysInMonth = endOfMonth.getDate();
    const monthlyData = Array.from({ length: daysInMonth }, (_, i) => ({
      label: `Ngày ${i + 1}`,
      revenue: 0,
    }));

    orders.forEach((order) => {
      if (monthlyData[order._id - 1]) {
        monthlyData[order._id - 1].revenue = order.revenue;
      }
    });

    return monthlyData;
  }
}
