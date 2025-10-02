// components/OrderTotal.jsx
export default function OrderTotal({ items = [], itemsTotal, total }) {
  const subtotal = items.reduce(
    (acc, it) => acc + it.productSnapshot.price * it.quantity,
    0
  );

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-3">Tổng giá trị</h4>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>Tạm tính:</span>
          <span>{subtotal.toLocaleString()} đ</span>
        </div>
        <div className="flex justify-between">
          <span>Phí vận chuyển:</span>
          <span>0 đ</span>
        </div>
        <hr />
        <div className="flex justify-between font-semibold">
          <span>Tổng cộng:</span>
          <span>{(total ?? subtotal).toLocaleString()} đ</span>
        </div>
      </div>
    </div>
  );
}
