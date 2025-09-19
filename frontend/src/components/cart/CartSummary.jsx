// src/components/CartSummary.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../store/cartSlice";

export default function CartSummary({ items }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const subtotal = items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);

  const onClear = () => {
    if (!window.confirm("Xóa toàn bộ sản phẩm trong giỏ?")) return;
    dispatch(clearCart());
  };

  const onCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-lg font-semibold">Tổng: <span className="text-red-600">{subtotal.toLocaleString()}đ</span></div>
      <div className="mt-4 flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700" onClick={onCheckout}>Thanh toán</button>
        <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100" onClick={onClear}>Xóa giỏ</button>
      </div>
    </div>
  );
}
