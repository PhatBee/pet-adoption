import React, { useState } from 'react';
import { FaCopy, FaCalendarAlt, FaDollarSign, FaCheckCircle, FaSave } from 'react-icons/fa'; // 1. Thêm icon
import { toast } from 'react-toastify';

// Hàm helper định dạng ngày
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

// Hàm helper định dạng tiền
const formatCurrency = (value) => {
  return value.toLocaleString('vi-VN') + 'đ';
};

// 2. Thêm prop onSave
export default function CouponCard({ coupon, onSave }) {
  const { 
      code, 
      discountType, 
      discountValue, 
      minOrderValue, 
      expiresAt,
      maxDiscountValue, // 3. Lấy thêm thông tin
      description,
      isSaved // Lấy cờ isSaved
    } = coupon;

    const [isSaving, setIsSaving] = useState(false); // State loading cục bộ

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  // 4. Hàm xử lý khi nhấn Lưu
  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      // Gọi hàm onSave (được truyền từ PromotionsPage)
      await onSave(coupon._id);
      // slice sẽ tự động cập nhật 'isSaved'
      toast.success("Đã lưu mã giảm giá!");
    } catch (errorMsg) {
      // Bắt lỗi (ví dụ: "Bạn đã lưu mã này rồi")
      toast.error(errorMsg || "Lưu mã thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. Cải thiện mô tả giảm giá
  let discountDescription = discountType === 'percentage'
    ? `Giảm ${discountValue}%`
    : `Giảm ${formatCurrency(discountValue)}`;
  
  if (discountType === 'percentage' && maxDiscountValue) {
    discountDescription += ` (tối đa ${formatCurrency(maxDiscountValue)})`;
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Phần màu bên trái */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 flex flex-col justify-center items-center md:w-1/3">
        <h3 className="text-2xl font-bold mb-2">{discountDescription}</h3>
        <p className="text-sm">Cho đơn hàng</p>
      </div>

      {/* Phần thông tin bên phải */}
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold uppercase text-gray-500">Mã khuyến mãi</span>
            <h4 className="text-xl font-bold text-gray-800">{code}</h4>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            <FaCopy />
            <span>Sao chép</span>
          </button>
        </div>

        {/* 6. Hiển thị mô tả (nếu có) */}
        {description && (
          <p className="text-sm text-gray-600 mb-3 italic">
            "{description}"
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <FaDollarSign className="text-green-500" size={18} />
            <span>
              Áp dụng cho đơn hàng tối thiểu: <strong className="text-gray-800">{formatCurrency(minOrderValue)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <FaCalendarAlt className="text-red-500" size={16} />
            <span>
              Hạn sử dụng: <strong className="text-gray-800">{formatDate(expiresAt)}</strong>
            </span>
          </div>
        </div>

        {/* 7. Nút Lưu (phần chân card) */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
          {isSaved ? (
            <div className="flex items-center gap-2 px-4 py-2 text-green-600">
              <FaCheckCircle />
              <span>Đã lưu</span>
            </div>
          ) : (
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSave />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu mã'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}