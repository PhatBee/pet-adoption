import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchRevenue } from "../../store/admin/adminStatsSlice"; // Đảm bảo đường dẫn đúng

export default function SalesChart() {
    const [view, setView] = useState("month");
    const dispatch = useDispatch();

    // 1. Lấy dữ liệu và trạng thái loading trực tiếp từ Redux store
    const { revenueData, loading, error } = useSelector((state) => state.adminStats);

    useEffect(() => {
        dispatch(fetchRevenue(view));
    }, [dispatch, view]);
    
    // Thêm phần xử lý trạng thái loading và lỗi để UX tốt hơn
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow p-6 mt-6 flex justify-center items-center h-96">
                <p className="text-gray-500">Đang tải dữ liệu biểu đồ...</p>
            </div>
        );
    }

    if (error) {
         return (
            <div className="bg-white rounded-xl shadow p-6 mt-6 flex justify-center items-center h-96">
                <p className="text-red-500">Lỗi khi tải dữ liệu: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#4f46e5] tracking-wide">
                    Biểu đồ doanh thu
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setView("week")} className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition ${view === "week"
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "text-gray-700 border-gray-300 hover:bg-gray-100"}`}>Tuần</button>
                    <button onClick={() => setView("month")} className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition ${view === "month"
                        ? "bg-[#4f46e5] text-white border-[#4f46e5]" : "text-gray-700 border-gray-300 hover:bg-gray-100"}`}>Tháng</button>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        // 2. Sử dụng dữ liệu trực tiếp từ Redux store
                        data={revenueData} 
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                        <XAxis
                            dataKey="label"
                            tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
                            axisLine={false}
                            tickFormatter={(v) => `${v / 1000000}tr`}
                        />
                        <Tooltip
                            formatter={(v) => [`${v.toLocaleString()}₫`, "Doanh thu"]}
                            contentStyle={{
                                borderRadius: "8px",
                                borderColor: "#4f46e5",
                                backgroundColor: "white",
                                fontWeight: "600",
                            }}
                            labelStyle={{
                                fontWeight: "700",
                                color: "#4f46e5",
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ r: 5, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                            activeDot={{ r: 7, fill: "#4f46e5" }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}