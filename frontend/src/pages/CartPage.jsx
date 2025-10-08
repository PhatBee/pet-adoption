// src/pages/CartPage.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../store/cartSlice";
import CartItem from "../components/cart/CartItem";
import CartSummary from "../components/cart/CartSummary";

export default function CartPage() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.cart);

  useEffect(() => {
    // Chỉ fetch cart nếu chưa có item nào, tránh fetch lại không cần thiết
    if (items.length === 0) {
      dispatch(fetchCart());
    }
  }, [dispatch, items.length]);

  // THAY ĐỔI QUAN TRỌNG: Chỉ hiển thị loading toàn trang khi đang tải và chưa có item nào
  if (isLoading && items.length === 0) {
    return <div className="p-6">Đang tải giỏ hàng...</div>;
  }

  if (!items || items.length === 0) {
    return <div className="container mx-auto p-6 text-center">Giỏ hàng của bạn đang trống.</div>;
  }

  return (
    <div className={`container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 ${isLoading ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="lg:col-span-2 space-y-4">
        {items.map((it) => (
          // Truyền `isLoading` xuống CartItem
          <CartItem key={it.product._id} item={it} isLoading={isLoading} />
        ))}
      </div>

      <aside className="lg:col-span-1">
        {/* Truyền `isLoading` xuống CartSummary */}
        <CartSummary items={items} isLoading={isLoading} />
      </aside>
    </div>
  );
}
