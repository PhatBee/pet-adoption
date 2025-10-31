import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon, removeCoupon, setPointsToUse, fetchSavedCoupons } from '../../store/orderSlice';
import CouponModal from './CouponModal'; // 2. Import Modal

// nhận vào tổng tiền hàng và tổng số điểm người dùng có

// 3. Nhận `itemsToDisplay` thay vì `itemsTotal`
export default function DiscountSection({ itemsToDisplay, userLoyaltyPoints = 0 }) {
    const dispatch = useDispatch();
    const [couponInput, setCouponInput] = useState(''); // Vẫn giữ để nhập tay
    const [isModalOpen, setIsModalOpen] = useState(false); // 4. State quản lý modal

    // Lấy các state liên quan đến giảm giá từ Redux store
    const {
        appliedCoupon,
        pointsToUse,
        couponValidationStatus,
        couponDiscount, // 5. Lấy couponDiscount từ slice
        savedCoupons // Lấy state coupon đã lưu
    } = useSelector((state) => state.order);

    // Tính tổng tiền hàng (để dùng cho slider điểm)
    const itemsTotal = itemsToDisplay.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);

    // 6. Hàm áp dụng mã (gửi `items`)
    const handleApplyCoupon = (code) => {
        if (!code.trim()) return;
        // Gửi `itemsToDisplay` (chỉ cần chứa product._id, category, petType)
        const itemsForValidation = itemsToDisplay.map(item => ({
            product: {
                _id: item.product._id,
                price: item.product.price,
                category: item.product.category,
                pet: item.product.pet
            },
            quantity: item.quantity
        }));
        dispatch(applyCoupon({ code: code.toUpperCase(), items: itemsForValidation }));
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        setCouponInput(''); // Xóa luôn text trong ô input
    };

    const handlePointsChange = (e) => {
        const points = Number(e.target.value);
        // Ngăn không cho nhập quá
        if (points > maxPointsCanUse) {
            dispatch(setPointsToUse(maxPointsCanUse));
        } else {
            dispatch(setPointsToUse(points));
        }
    };

    // 7. Mở modal và tải danh sách coupon
    const handleOpenModal = () => {
        // Gửi `items` đi để backend tính toán
        const itemsForValidation = itemsToDisplay.map(item => ({
            product: {
                _id: item.product._id,
                price: item.product.price,
                category: item.product.category,
                pet: item.product.pet
            },
            quantity: item.quantity
        }));
        
        // Luôn tải lại để có thứ tự ưu tiên đúng nhất
        dispatch(fetchSavedCoupons(itemsForValidation));
        setIsModalOpen(true);
    };

    // 8. Khi chọn mã từ modal
    const handleSelectCouponFromModal = (code) => {
        setIsModalOpen(false);
        setCouponInput(code); // Điền code vào ô input
        handleApplyCoupon(code); // Tự động áp dụng
    };

    // Tính toán số điểm tối đa (phải trừ cả coupon)
    const maxPointsCanUse = Math.floor(Math.min(userLoyaltyPoints, itemsTotal - (couponDiscount || 0)));

   return (
        <>
            <div className="border rounded-lg p-4 bg-white shadow-sm space-y-6">
                {/* --- Phần Mã giảm giá --- */}
                <div>
                    <h4 className="font-semibold text-lg mb-2">Mã giảm giá</h4>
                    {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                                <p className="font-semibold text-green-700">Đã áp dụng mã: {appliedCoupon.code}</p>
                                {/* 10. Hiển thị số tiền giảm thực tế */}
                                <p className="text-sm text-green-600">
                                    Bạn được giảm: {couponDiscount.toLocaleString()}đ
                                </p>
                            </div>
                            <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700 font-medium">
                                Xóa
                            </button>
                        </div>
                    ) : (
                        // 11. Giao diện nhập mã và CHỌN MÃ
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="Nhập mã giảm giá"
                                className="flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                            {/* Nút Chọn mã (mở modal) */}
                            <button
                                onClick={handleOpenModal}
                                title="Chọn từ mã đã lưu"
                                className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
                            >
                                Chọn mã
                            </button>
                            {/* Nút Áp dụng (cho mã nhập tay) */}
                            <button
                                onClick={() => handleApplyCoupon(couponInput)}
                                disabled={couponValidationStatus === 'loading'}
                                className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {couponValidationStatus === 'loading' ? 'Đang...' : 'Áp dụng'}
                            </button>
                        </div>
                    )}
                </div>

                {/* --- Phần Dùng xu tích lũy --- */}
                {userLoyaltyPoints > 0 && (
                    <div className="border-t pt-6">
                        <h4 className="font-semibold text-lg mb-2">Dùng xu tích lũy</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Bạn đang có <span className="font-bold text-blue-600">{userLoyaltyPoints.toLocaleString()}</span> xu. (Tối đa: {maxPointsCanUse.toLocaleString()} xu)
                        </p>
                        {maxPointsCanUse > 0 ? (
                            <>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPointsCanUse}
                                    step="1000" // Cho phép kéo mượt hơn
                                    value={pointsToUse}
                                    onChange={handlePointsChange}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-center font-semibold text-lg mt-2">
                                    Sử dụng: <span className="text-red-600">{pointsToUse.toLocaleString()} xu</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-500">Bạn không thể dùng xu cho đơn hàng này (có thể do tổng tiền bằng 0).</p>
                        )}
                    </div>
                )}
            </div>
            
            {/* 12. Render Modal */}
            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                items={savedCoupons.items}
                status={savedCoupons.status}
                onSelectCoupon={handleSelectCouponFromModal}
            />
        </>
    );
}