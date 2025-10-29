import React from "react";
import type { Order } from "../../store/slices/adminOrderSlice";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderActionMenu from "./OrderActionMenu";

interface OrderListProps {
  orders: Order[];
  onViewDetail: (order: Order) => void;
}

export default function OrderList({ orders = [], onViewDetail }: OrderListProps) {
  if (!orders.length) return <p className="text-gray-500">Không có đơn hàng.</p>;
  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Mã</th>
            <th className="p-3 text-left">Người đặt</th>
            <th className="p-3 text-left">SĐT</th>
            <th className="p-3 text-left">Địa chỉ</th>
            <th className="p-3 text-right">Tổng</th>
            <th className="p-3 text-left">Trạng thái</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: Order) => (
            <tr key={o._id} className="border-t hover:bg-gray-50">
              <td className="p-3 cursor-pointer text-blue-600" onClick={() => onViewDetail(o)}>#{o._id.slice(-8)}</td>
              <td className="p-3">{o.shippingAddress.fullName}</td>
              <td className="p-3">{o.shippingAddress.phone}</td>
              <td className="p-3">{o.shippingAddress.street+", "+o.shippingAddress.ward+", "+o.shippingAddress.district+", "+o.shippingAddress.city}</td>
              <td className="p-3 text-right">{(o.itemsTotal).toLocaleString()}₫</td>
              <td className="p-3"><OrderStatusBadge status={o.status} /></td>
              <td className="p-3 text-center"><OrderActionMenu order={o} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
