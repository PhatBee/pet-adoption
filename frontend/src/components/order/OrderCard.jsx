// src/components/OrderCard.jsx
import React from "react";
import { format } from "date-fns";

// 1. Tạo một đối tượng để "phiên dịch" trạng thái và màu sắc
const statusMap = {
  pending: { text: "Chờ xử lý", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { text: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  shipping: { text: "Đang giao", color: "bg-indigo-100 text-indigo-800" },
  delivered: { text: "Hoàn thành", color: "bg-green-100 text-green-800" },
  cancelled: { text: "Đã hủy", color: "bg-red-100 text-red-800" },
  cancel_requested: { text: "Yêu cầu hủy", color: "bg-orange-100 text-orange-800" },
  refunded: { text: "Đã hoàn tiền", color: "bg-gray-100 text-gray-800" },
};

export default function OrderCard({ order, onView }) {
  // order: { _id, items:[{productSnapshot,quantity}] or items [{product, productSnapshot, quantity}], total, status, createdAt }
  const total = order.total || order.items.reduce((s, it) => s + ((it.productSnapshot?.price || it.product?.price || 0) * it.quantity), 0);
  const shortId = order._id?.toString().slice(-6).toUpperCase();

  const displayStatus = statusMap[order.status] || { text: order.status, color: "bg-gray-100 text-gray-800" };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500">Mã đơn: <span className="font-mono font-semibold text-gray-700">{shortId}</span></div>
          <div className="text-sm text-gray-500 mt-1">Ngày: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</div>
          <button className="mt-2 text-sm text-blue-600" onClick={() => onView(order._id)}>Xem chi tiết</button>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-red-600">{total.toLocaleString()}đ</div>
          {/* 3. Sử dụng thông tin trạng thái để hiển thị huy hiệu màu */}
          <span className={`px-2 py-1 text-xs font-semibold rounded-full mt-1 inline-block ${displayStatus.color}`}>
            {displayStatus.text}
          </span>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        {order.items.slice(0, 3).map((it, idx) => {
          const p = it.productSnapshot || it.product || {};
          return (
            <div key={idx} className="flex gap-3 items-center mb-2">
              <img src={p.thumbnail} alt={p.name} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">x{it.quantity} • {(p.price || 0).toLocaleString()}đ</div>
              </div>
            </div>
          );
        })}
        {order.items.length > 3 && <div className="text-sm text-gray-500">... và {order.items.length - 3} sản phẩm khác</div>}
      </div>
    </div>
  );
}
