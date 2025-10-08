// src/components/CartSummary.jsx
import React from "react";
// Cập nhật import
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../../store/cartSlice";

export default function CartSummary({ items }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Lấy danh sách ID sản phẩm đã chọn từ store
  const { selectedItems } = useSelector((state) => state.cart);

  // 2. Lọc ra các item object đầy đủ dựa trên ID đã chọn
  const selectedCartItems = items.filter(item => selectedItems.includes(item.product._id));

  // 3. Tính tổng tiền chỉ trên các sản phẩm đã được lọc
  const subtotal = selectedCartItems.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);

  // const subtotal = items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);

  const onClear = () => {
    if (!window.confirm("Xóa toàn bộ sản phẩm trong giỏ?")) return;
    dispatch(clearCart());
  };

  const onCheckout = () => {
    // 4. Kiểm tra nếu không có sản phẩm nào được chọn
    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }
    // Chuyển hướng đến trang checkout và truyền đi danh sách sản phẩm đã chọn
    navigate('/checkout', { state: { itemsToCheckout: selectedCartItems } });
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Hiển thị số lượng sản phẩm được chọn */}
      <div className="text-md mb-2">
        Tổng cộng ({selectedCartItems.length} sản phẩm):
      </div>
      <div className="text-xl font-semibold">
        <span className="text-red-600">{subtotal.toLocaleString()}đ</span>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          onClick={onCheckout}
          // Vô hiệu hóa nút nếu không có gì được chọn
          disabled={selectedCartItems.length === 0}
        >
          Thanh toán
        </button>
        <button
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100"
          onClick={onClear}>
          Xóa giỏ
        </button>
      </div>
    </div>
  );
}
