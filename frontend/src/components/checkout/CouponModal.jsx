// src/components/checkout/CouponModal.jsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

// Hàm helper định dạng (có thể import từ file utils)
const formatCurrency = (val) => (val || 0).toLocaleString('vi-VN') + 'đ';

// Card nhỏ hiển thị chi tiết từng coupon
const CouponItem = ({ coupon, onSelect }) => {
  const { code, description, expiresAt, potentialDiscount } = coupon;

  const discountDescription = coupon.discountType === 'percentage'
    ? `Giảm ${coupon.discountValue}%`
    : `Giảm ${formatCurrency(coupon.discountValue)}`;

  const isDisabled = potentialDiscount === 0;

  return (
    <div className={`border rounded-lg p-3 flex ${isDisabled ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
      <div className="flex-1 pr-3">
        <h5 className="font-bold text-blue-600">{code}</h5>
        <p className="text-sm font-semibold">{discountDescription}</p>
        <p className="text-xs text-gray-500 mt-1">{description || 'Áp dụng cho sản phẩm nhất định'}</p>
        <p className="text-xs text-red-500 mt-1">HSD: {new Date(expiresAt).toLocaleDateString('vi-VN')}</p>
      </div>
      <div className="flex flex-col items-center justify-center">
        {potentialDiscount > 0 ? (
          <>
            <span className="text-xs text-green-600">Giảm</span>
            <span className="font-bold text-green-600">{formatCurrency(potentialDiscount)}</span>
          </>
        ) : (
          <span className="text-xs text-gray-400">Không áp dụng</span>
        )}
        <button
          onClick={() => onSelect(code)}
          disabled={isDisabled}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md mt-2 hover:bg-blue-700 disabled:bg-gray-300"
        >
          Chọn
        </button>
      </div>
    </div>
  );
};

// Component Modal chính
export default function CouponModal({ isOpen, onClose, items, status, onSelectCoupon }) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="bg-gray-100 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b bg-white rounded-t-lg flex justify-between items-center">
          <h4 className="font-semibold text-lg">Chọn mã giảm giá của bạn</h4>
          <button onClick={onClose} className="text-gray-500 text-2xl">&times;</button>
        </div>
        
        {/* Body (scrollable) */}
        <div className="p-4 overflow-y-auto space-y-3">
          {status === 'loading' && (
            <div className="flex justify-center items-center h-20">
              <FaSpinner className="animate-spin text-blue-500" size={24} />
            </div>
          )}
          {status === 'failed' && (
             <p className="text-red-500 text-center">Không thể tải mã giảm giá. Vui lòng thử lại.</p>
          )}
          {status === 'succeeded' && items.length === 0 && (
            <p className="text-gray-500 text-center py-4">Bạn chưa lưu mã giảm giá nào, hoặc không có mã nào hợp lệ với giỏ hàng.</p>
          )}
          {status === 'succeeded' && items.map((coupon) => (
            <CouponItem key={coupon._id} coupon={coupon} onSelect={onSelectCoupon} />
          ))}
        </div>
      </div>
    </div>
  );
}