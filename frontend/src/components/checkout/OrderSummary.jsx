export default function OrderSummary({ items }) {
  const itemsTotal = items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);
  // shipping fee - nếu cần
  const shippingFee = 0;
  const total = itemsTotal + shippingFee;

  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm">
      <h4 className="font-semibold text-lg mb-4 text-center">Tóm tắt đơn hàng</h4>

      {/* Không cần hiển thị lại danh sách sản phẩm ở đây vì đã có ở bên trái */}

      <div className="mt-4 border-t pt-4 space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Tạm tính</span>
          <span className="font-medium">{itemsTotal.toLocaleString()}đ</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Phí vận chuyển</span>
          <span className="font-medium">{shippingFee ? shippingFee.toLocaleString() + "đ" : "Miễn phí"}</span>
        </div>
        <div className="flex justify-between font-bold text-xl mt-2 pt-3 border-t">
          <span>Tổng cộng</span>
          <span className="text-red-600">{total.toLocaleString()}đ</span>
        </div>
      </div>
    </div>
  );
}
