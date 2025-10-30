import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveCoupons, selectActiveCoupons, selectCouponIsLoading, saveCouponThunk } from '../store/couponSlice';
import CouponCard from '../components/promotion/CouponCard';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify'; // 2. Import toast

export default function PromotionsPage() {
  const dispatch = useDispatch();
  const coupons = useSelector(selectActiveCoupons);
  const isLoading = useSelector(selectCouponIsLoading);

  useEffect(() => {
      dispatch(fetchActiveCoupons());
  }, [dispatch]);

  // 3. Hàm xử lý lưu
  const handleSaveCoupon = async (couponId) => {
    // dispatch thunk và bắt lỗi (nếu có)
    const resultAction = await dispatch(saveCouponThunk(couponId));
    
    // Nếu thunk bị reject, hiển thị lỗi
    if (saveCouponThunk.rejected.match(resultAction)) {
      toast.error(resultAction.payload); // Hiển thị lỗi (ví dụ: "Đã lưu mã này rồi")
      throw new Error(resultAction.payload); // Ném lỗi để CouponCard biết
    }
  };

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
               <CouponCard 
                  key={coupon._id} 
                  coupon={coupon} 
                  onSave={handleSaveCoupon} // 4. Truyền hàm onSave
                />
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