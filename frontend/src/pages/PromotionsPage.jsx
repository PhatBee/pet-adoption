import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveCoupons, selectActiveCoupons, selectCouponIsLoading } from '../store/couponSlice';
import CouponCard from '../components/promotion/CouponCard';
import { FaSpinner } from 'react-icons/fa';

export default function PromotionsPage() {
  const dispatch = useDispatch();
  const coupons = useSelector(selectActiveCoupons);
  const isLoading = useSelector(selectCouponIsLoading);

  useEffect(() => {
    // Chỉ gọi API nếu chưa có dữ liệu
    if (coupons.length === 0) {
      dispatch(fetchActiveCoupons());
    }
  }, [dispatch, coupons.length]);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">🎉 Khuyến Mãi Hấp Dẫn</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-blue-500" size={40} />
            <span className="ml-3 text-lg text-gray-600">Đang tải khuyến mãi...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coupons.length > 0 ? (
              coupons.map((coupon) => (
                <CouponCard key={coupon._id} coupon={coupon} />
              ))
            ) : (
              <p className="text-center text-gray-500 lg:col-span-2">
                Hiện tại không có khuyến mãi nào. Vui lòng quay lại sau!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}