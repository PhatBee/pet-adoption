// src/components/OrderItemRow.jsx
import React, { useState } from "react";
import ReviewModal from "../order/ReviewModal"; // 1. Import component modal mới
import ReviewForm from "../order/ReviewForm"; // 2. Import form đánh giá
import { useDispatch } from "react-redux";
// import { useDispatch } from "react-redux";
import { submitReview } from "../../store/orderDetailSlice";
import { useParams, Link } from "react-router-dom";


export default function OrderItemRow({ item, orderId, existingReview, orderStatus }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const p = item.productSnapshot || item.product || {};

  const handleSubmitReview = async ({ rating, comment }) => {
    try {
      await dispatch(submitReview({ orderId, productId: item.product, rating, comment })).unwrap();
      setIsModalOpen(false); // 3. Đóng modal sau khi gửi thành công
    } catch (error) {
    }
  };

  return (
    <>
    <div className="flex gap-4 p-3 border-b">
      <Link
          to={`/orders/${orderId}/item/${item.product}/snapshot`}
          className="w-20 h-20 flex-shrink-0"
        >
          <img src={p.thumbnail} alt={p.name} className="w-20 h-20 object-cover rounded" />
        </Link>
      <div className="flex-1">
        <Link
          to={`/orders/${orderId}/item/${item.product}/snapshot`}
          className="w-20 h-20 flex-shrink-0"
        >
          <div className="font-medium">{p.name}</div>
        </Link>
        <div className="text-sm text-gray-500">x{item.quantity} • {p.price?.toLocaleString()}đ</div>

        {/* Review area */}
        {/* Chỉ hiển thị khu vực đánh giá khi đơn hàng đã được giao */}
          {orderStatus === 'delivered' && (
            <div className="mt-2">
              {existingReview ? (
                <>
                  <div className="text-sm">Đánh giá của bạn: <span className="font-medium">{existingReview.rating}★</span></div>
                  <div className="text-sm">{existingReview.comment}</div>
                  <button className="text-sm text-blue-600 mt-1" onClick={() => setIsModalOpen(true)}>
                    Chỉnh sửa đánh giá
                  </button>
                </>
              ) : (
                <button className="text-sm text-blue-600" onClick={() => setIsModalOpen(true)}>
                  Đánh giá sản phẩm
                </button>
              )}
            </div>
          )}
        </div>
        <div className="text-right font-semibold">{(p.price * item.quantity).toLocaleString()}đ</div>
      </div>

      {/* 4. Render Modal ở đây */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={existingReview ? "Chỉnh sửa đánh giá" : "Viết đánh giá sản phẩm"}
      >
        <ReviewForm
          initial={existingReview}
          onSubmit={handleSubmitReview}
        />
      </ReviewModal>
    </>
  );
}
