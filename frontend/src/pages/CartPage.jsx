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
    dispatch(fetchCart());
  }, [dispatch]);

  if (isLoading) return <div className="p-6">Đang tải giỏ hàng...</div>;

  if (!items || items.length === 0) {
    return <div className="container mx-auto p-6 text-center">Giỏ hàng của bạn đang trống.</div>;
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {items.map((it) => (
          <CartItem key={it.product._id} item={it} />
        ))}
      </div>

      <aside className="lg:col-span-1">
        <CartSummary items={items} />
      </aside>
    </div>
  );
}
