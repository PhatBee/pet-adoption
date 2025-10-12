import React from "react";

const STATUS_MAP = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPING: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function OrderStatusBadge({ status }) {
  const cls = STATUS_MAP[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`px-3 py-1 text-sm rounded-full font-semibold ${cls}`}>
      {status}
    </span>
  );
}
