import React from "react";

export default function StockBadge({ stock = 0 }) {
  if (stock <= 0) {
    return <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Hết hàng</span>;
  }
  return <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Còn {stock} sản phẩm</span>;
}
