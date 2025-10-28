import React from "react";

const STATUS_MAP = {
  pending:   { label: "Chờ xử lý", class: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Đã xác nhận", class: "bg-blue-100 text-blue-800" },
  shipping:  { label: "Đang giao", class: "bg-purple-100 text-purple-800" },
  preparing: { label: "Đang chuẩn bị", class: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Đã giao", class: "bg-green-100 text-green-800" },
  cancelled: { label: "Đã hủy", class: "bg-red-100 text-red-800" },
  refunded:  { label: "Hoàn tiền", class: "bg-gray-100 text-gray-700" },
  cancel_requested: { label: "Yêu cầu hủy", class: "bg-orange-100 text-orange-800" },
};

type StatusKey = keyof typeof STATUS_MAP;

interface OrderStatusBadgeProps {
  status: StatusKey | string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const key = status.toLowerCase() as StatusKey;;
  const config = STATUS_MAP[key] || STATUS_MAP.pending;
  return (
    <span className={`px-3 py-1 text-sm rounded-full font-semibold ${config.class}`}>
      {config.label}
    </span>
  );
}
