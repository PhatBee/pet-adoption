// src/components/SalesChart.tsx
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppDispatch, useAppSelector } from "../store/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchRevenue } from "../store/slices/adminStatsSlice";

export default function SalesChart() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { revenueData, loading, error } = useAppSelector((state) => state.adminStats);

  const [view, setView] = useState<"week" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!token) return;

    if (view === "custom") {
      if (startDate && endDate) {
        dispatch(fetchRevenue({ view, startDate, endDate }));
      }
    } else {
      dispatch(fetchRevenue({ view }));
    }
  }, [dispatch, view, startDate, endDate, token]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#4f46e5] tracking-wide">Biểu đồ doanh thu</h3>

        {/* Bộ chọn chế độ xem */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setView("week");
              setStartDate(null);
              setEndDate(null);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition ${
              view === "week"
                ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => {
              setView("month");
              setStartDate(null);
              setEndDate(null);
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold border transition ${
              view === "month"
                ? "bg-[#4f46e5] text-white border-[#4f46e5]"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Tháng
          </button>

          {/* Custom date filter */}
          <div className="flex items-center gap-1">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setView("custom");
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              placeholderText="Từ ngày"
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-gray-500">-</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                setView("custom");
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              dateFormat="dd/MM/yyyy"
              placeholderText="Đến ngày"
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
              setView("month");
            }}
            className="px-3 py-1.5 rounded-md text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="h-72">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
