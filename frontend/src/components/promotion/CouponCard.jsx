import React from 'react';
import { FaCopy, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
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

export default function CouponCard({ coupon }) {
  const { code, discountType, discountValue, minOrderValue, expiresAt } = coupon; //

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  // Định dạng mô tả giảm giá
  const discountDescription = discountType === 'percentage'
    ? `Giảm ${discountValue}%`
    : `Giảm ${formatCurrency(discountValue)}`;

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
      </div>
    </div>
  );
}