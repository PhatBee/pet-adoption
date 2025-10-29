// src/components/admin/StatsTable.jsx
export default function StatsTable() {
  const stats = [
    { name: "Đơn đã đặt hôm nay", value: 32 },
    { name: "Doanh thu tháng này", value: "45.500.000₫" },
    { name: "Tổng sản phẩm bán ra", value: 980 },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-3">Thống kê nhanh</h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2">Chỉ tiêu</th>
            <th className="py-2">Giá trị</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((row) => (
            <tr key={row.name} className="border-b hover:bg-gray-50">
              <td className="py-2">{row.name}</td>
              <td className="py-2 font-medium">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
