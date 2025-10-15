// src/components/order/OrderTotal.jsx

// Component giờ sẽ nhận vào toàn bộ `order` object
export default function OrderTotal({ order }) {
  if (!order) return null;

  const { itemsTotal, couponDiscount, pointsDiscount, total } = order;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h4 className="font-semibold mb-3">Tổng giá trị đơn hàng</h4>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{itemsTotal.toLocaleString()} đ</span>
        </div>
        
        {/* Chỉ hiển thị nếu có giảm giá từ coupon */}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá (coupon):</span>
            <span>-{couponDiscount.toLocaleString()} đ</span>
          </div>
        )}

        {/* Chỉ hiển thị nếu có sử dụng điểm */}
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Giảm giá (xu):</span>
            <span>-{pointsDiscount.toLocaleString()} đ</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span>Miễn phí</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Tổng cộng:</span>
          <span className="text-red-600">{total.toLocaleString()} đ</span>
        </div>
      </div>
    </div>
  );
}