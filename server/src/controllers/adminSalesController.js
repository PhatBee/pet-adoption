import { getRevenueByWeek, getRevenueByMonth } from "../services/admin/adminSalesService.js";

export const getRevenueStats = async (req, res) => {
  try {
    const { view } = req.query;
    let data;

    if (view === "week") data = await getRevenueByWeek();
    else data = await getRevenueByMonth();

    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
    res.status(500).json({ message: "Lỗi server khi thống kê doanh thu" });
  }
};
