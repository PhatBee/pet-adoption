import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";

const STATUS_OPTIONS = ["pending","confirmed","preparing","shipping","delivered","cancel_requested","cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/orders");
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Lấy danh sách đơn thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleChangeStatus = async (orderId, newStatus) => {
    const reason = window.prompt("Lý do (tuỳ chọn):", "");
    try {
      await axiosClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus, reason });
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
      {loading ? <p>Loading...</p> : (
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Mã</th>
              <th className="p-2">Khách</th>
              <th className="p-2">Tổng</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-t">
                <td className="p-2">{o._id.slice(-6)}</td>
                <td className="p-2">{o.user ? o.user.email || o.user.name : "—"}</td>
                <td className="p-2">{o.total}</td>
                <td className="p-2"><span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700">{o.status}</span></td>
                <td className="p-2">
                  <select defaultValue={o.status} onChange={(e) => handleChangeStatus(o._id, e.target.value)}>
                    <option value="">— Chọn —</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}