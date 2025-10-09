import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { applyCoupon, removeCoupon, setPointsToUse } from '../../store/orderSlice';

// nhận vào tổng tiền hàng và tổng số điểm người dùng có

export default function DiscountSection({ itemsTotal, userLoyaltyPoints = 0 }) {
    const dispatch = useDispatch();
    const [couponInput, setCouponInput] = useState('');

    // Lấy các state liên quan đến giảm giá từ Redux store
    const {
        appliedCoupon,
        pointsToUse,
        couponValidationStatus,
    } = useSelector((state) => state.order);

    const handleApplyCoupon = () => {
        if (!couponInput.trim()) return;
        dispatch(applyCoupon({ code: couponInput, itemsTotal }));
    };

    const handleRemoveCoupon = () => {
        dispatch(removeCoupon());
        setCouponInput(''); // Xóa luôn text trong ô input
    };

    const handlePointsChange = (e) => {
        const points = Number(e.target.value);
        dispatch(setPointsToUse(points));
    };

    // Tính toán số điểm tối đa có thể sử dụng (không vượt quá điểm đang có và tổng tiền hàng)
    const maxPointsCanUse = Math.min(userLoyaltyPoints, itemsTotal);

    return (
        <div className="border rounded-lg p-4 bg-white shadow-sm space-y-6">
            {/* --- Phần Mã giảm giá --- */}
            <div>
                <h4 className="font-semibold text-lg mb-2">Mã giảm giá</h4>
                {appliedCoupon ? (
                    // Giao diện khi đã áp dụng mã thành công
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                            <p className="font-semibold text-green-700">Đã áp dụng mã: {appliedCoupon.code}</p>
                            <p className="text-sm text-green-600">Bạn được giảm giá {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `${appliedCoupon.discountValue.toLocaleString()}đ`}</p>
                        </div>
                        <button
                            onClick={handleRemoveCoupon}
                            className="text-red-500 hover:text-red-700 font-medium"
                        >
                            Xóa
                        </button>
                    </div>
                ) : (
                    // Giao diện nhập mã
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Nhập mã giảm giá"
                            className="flex-grow p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleApplyCoupon}
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
                        Bạn đang có <span className="font-bold text-blue-600">{userLoyaltyPoints.toLocaleString()}</span> xu.
                    </p>
                    {maxPointsCanUse > 0 ? (
                        <>
                            <input
                                type="range"
                                min="0"
                                max={maxPointsCanUse}
                                value={pointsToUse}
                                onChange={handlePointsChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-center font-semibold text-lg mt-2">
                                Sử dụng: <span className="text-red-600">{pointsToUse.toLocaleString()} xu</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Bạn không thể dùng xu cho đơn hàng này.</p>
                    )}
                </div>
            )}
        </div>
    );
}