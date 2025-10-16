import Order from "../../models/Order.js";

export const getRevenueByWeek = async () => {
  const today = new Date();
  // Đảm bảo today luôn là cuối ngày để bao gồm tất cả đơn hàng trong ngày
  today.setHours(23, 59, 59, 999); 

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  // Đặt thời gian về đầu ngày
  sevenDaysAgo.setHours(0, 0, 0, 0); 

  const orders = await Order.aggregate([
    {
      $match: {
        status: "delivered",
        deliveredAt: { $gte: sevenDaysAgo, $lte: today },
      },
    },
    {
      $group: {
        // Nhóm các đơn hàng theo ngày trong tuần
        _id: { $dayOfWeek: "$deliveredAt" }, // 1: CN, 2: T2, ..., 7: T7
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { "_id": 1 } }, // Sắp xếp theo thứ tự các ngày trong tuần
  ]);

  // Tạo một mảng 7 ngày gần nhất với nhãn chính xác
  const dayLabels = [];
  const dayMap = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Lấy tên thứ (T2, T3...) và ngày (15/10)
    const dayName = dayMap[d.getDay()];
    const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;
    dayLabels.push({ label: `${dayName} (${dateLabel})`, dayOfWeek: d.getDay() + 1, revenue: 0 });
  }

  // Gán doanh thu từ kết quả query vào mảng ngày
  orders.forEach(order => {
    const dayData = dayLabels.find(d => d.dayOfWeek === order._id);
    if (dayData) {
      dayData.revenue = order.revenue;
    }
  });

  // Chỉ trả về label và revenue để tương thích với biểu đồ
  return dayLabels.map(({ label, revenue }) => ({ label, revenue }));
};

export const getRevenueByMonth = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const orders = await Order.aggregate([
    {
      $match: {
        status: "delivered",
        deliveredAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      },
    },
    {
      $group: {
        // Nhóm các đơn hàng theo ngày trong tháng
        _id: { $dayOfMonth: "$deliveredAt" },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { "_id": 1 } }, // Sắp xếp theo ngày
  ]);

  // Lấy số ngày trong tháng hiện tại
  const daysInMonth = endOfMonth.getDate();
  
  // Tạo một mảng rỗng cho tất cả các ngày trong tháng
  const monthlyData = Array.from({ length: daysInMonth }, (_, i) => ({
    label: `Ngày ${i + 1}`,
    revenue: 0,
  }));

  // Gán doanh thu từ kết quả query vào mảng ngày tương ứng
  orders.forEach(order => {
    // _id là ngày (1, 2, 3,...), khớp với index của mảng (0, 1, 2,...)
    if (monthlyData[order._id - 1]) {
      monthlyData[order._id - 1].revenue = order.revenue;
    }
  });

  return monthlyData;
};