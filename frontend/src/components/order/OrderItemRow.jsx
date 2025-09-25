// src/components/OrderItemRow.jsx
import React, { useState } from "react";
import ReviewForm from "./ReviewForm";
import { useDispatch } from "react-redux";
import { submitReview } from "../features/orderDetail/orderDetailSlice";

export default function OrderItemRow({ item, orderId, existingReview }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);

  const p = item.productSnapshot || item.product || {};

  const handleSubmitReview = async ({ rating, comment }) => {
    await dispatch(submitReview({ orderId, productId: item.product, rating, comment })).unwrap();
    setEditing(false);
  };

  return (
    <div className="flex gap-4 p-3 border-b">
      <img src={p.thumbnail} alt={p.name} className="w-20 h-20 object-cover rounded" />
      <div className="flex-1">
        <div className="font-medium">{p.name}</div>
        <div className="text-sm text-gray-500">x{item.quantity} • {p.price?.toLocaleString()}đ</div>

        {/* Review area */}
        {existingReview ? (
          <div className="mt-2">
            <div className="text-sm">Đánh giá của bạn: <span className="font-medium">{existingReview.rating}★</span></div>
            <div className="text-sm text-gray-700">{existingReview.comment}</div>
            <button className="text-sm text-blue-600 mt-1" onClick={()=>setEditing(true)}>Chỉnh sửa đánh giá</button>
            {editing && <ReviewForm initial={existingReview} onSubmit={handleSubmitReview} />}
          </div>
        ) : (
          <div className="mt-2">
            <button className="text-sm text-blue-600" onClick={()=>setEditing(true)}>Đánh giá sản phẩm</button>
            {editing && <ReviewForm initial={null} onSubmit={handleSubmitReview} />}
          </div>
        )}
      </div>

      <div className="text-right font-semibold">{(p.price * item.quantity).toLocaleString()}đ</div>
    </div>
  );
}
