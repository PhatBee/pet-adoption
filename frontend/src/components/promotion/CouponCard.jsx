import React, { useState } from 'react';
// 1. Thêm các icon mới
import {
  FaCopy, FaCalendarAlt, FaDollarSign, FaCheckCircle, FaSave,
  FaTags, FaPaw, FaBoxOpen, FaGlobeAsia
} from 'react-icons/fa';
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
export default function CouponCard({ coupon, onSave, isAuthenticated }) {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    expiresAt,
    maxDiscountValue, // 3. Lấy thêm thông tin
    description,
    isSaved, // Lấy cờ isSaved
    appliesTo, // VD: 'specific_products'
    productIds, // VD: [{_id: '1', name: 'Pate'}]
    categoryIds,
    petTypeIds
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

  // 3. Helper component để hiển thị danh sách áp dụng
  const renderAppliesTo = () => {
    // chuẩn bị các section sẽ hiển thị
    const sections = [];

    // Nếu admin chọn ALL_PRODUCTS thì vẫn thêm một section "Tất cả" để hiển thị (nếu không có cụ thể nào thì chỉ show phần này)
    if (appliesTo === 'all_products') {
      sections.push({
        key: 'all_products',
        icon: <FaGlobeAsia className="text-blue-500" size={16} />,
        title: 'Áp dụng cho:',
        items: [{ _id: 'all', name: 'Tất cả sản phẩm' }],
        showWhenEmpty: true, // hiện khi không có mục cụ thể
      });
    }

    // Nếu có categoryIds
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      sections.push({
        key: 'categories',
        icon: <FaTags className="text-teal-500" size={16} />,
        title: 'Danh mục áp dụng:',
        items: categoryIds,
      });
    }

    // Nếu có petTypeIds
    if (Array.isArray(petTypeIds) && petTypeIds.length > 0) {
      sections.push({
        key: 'pet_types',
        icon: <FaPaw className="text-orange-500" size={16} />,
        title: 'Loại thú cưng áp dụng:',
        items: petTypeIds,
      });
    }

    // Nếu có productIds
    if (Array.isArray(productIds) && productIds.length > 0) {
      sections.push({
        key: 'products',
        icon: <FaBoxOpen className="text-purple-500" size={16} />,
        title: 'Sản phẩm áp dụng:',
        items: productIds,
      });
    }

    // Nếu không có section nào (và appliesTo không phải all_products) -> không render
    if (sections.length === 0) return null;

    return (
      <div className="space-y-3">
        {sections.map((section) => {
          // Nếu section là all_products và có các section khác tồn tại, muốn ẩn "Tất cả" khi có cụ thể ?
          // Hiện logic: nếu đây là all_products và có items cụ thể khác (length > 1), ta vẫn hiển thị cả "Tất cả" + các mục cụ thể.
          // Nếu bạn muốn ẩn "Tất cả" khi có cụ thể, uncomment đoạn kiểm tra dưới.
          // if (section.key === 'all_products' && sections.length > 1) return null;

          const items = Array.isArray(section.items) ? section.items : [];

          // Nếu section đánh dấu chỉ hiển thị khi empty nhưng không empty -> ẩn
          if (section.showWhenEmpty && items.length > 0) {
            // nếu muốn vẫn hiển thị "Tất cả" kèm cụ thể, comment dòng này
            // return null;
          }

          return (
            <div key={section.key} className="flex items-start gap-3 text-gray-600">
              <div className="mt-1 flex-shrink-0">{section.icon}</div>
              <div>
                <span className="font-semibold text-gray-700">{section.title}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {items.map((item) => {
                    // item có thể là object {_id, name} hoặc string
                    const id = item?._id ?? item?.id ?? item;
                    const name = item?.name ?? item?.title ?? String(item);
                    return (
                      <span
                        key={id}
                        className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-200"
                      >
                        {name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

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

        {/* 4. Cập nhật khối thông tin */}
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

          {renderAppliesTo()}

        </div>

        {/* 5. Thêm flex-grow để đẩy nút Lưu xuống dưới */}
        <div className="flex-grow"></div>

        {/* 7. Nút Lưu (phần chân card) */}
        {/* 2. Bọc toàn bộ khối nút Lưu bằng điều kiện `isAuthenticated` */}
        {isAuthenticated && (
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
        )}
      </div>
    </div>
  );
}