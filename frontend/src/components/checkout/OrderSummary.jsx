export default function OrderSummary({ items }) {
  const itemsTotal = items.reduce((s, it) => s + (it.product?.price || 0) * it.quantity, 0);
  // shipping fee - nếu cần
  const shippingFee = 0;
  const total = itemsTotal + shippingFee;

  return (
    <div className="border rounded p-4 bg-white">
      <h4 className="font-semibold mb-3">Đơn hàng</h4>
      <div className="space-y-2 max-h-64 overflow-auto">
        {items.map((it) => (
          <div key={it.product._id} className="flex items-center gap-3">
            <img src={it.product.thumbnail} alt={it.product.name} className="w-14 h-14 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{it.product.name}</div>
              <div className="text-sm text-gray-500">x{it.quantity} • {it.product.price.toLocaleString()}đ</div>
            </div>
            <div>{(it.product.price * it.quantity).toLocaleString()}đ</div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-3 text-right">
        <div className="flex justify-between"><div>Tạm tính</div><div>{itemsTotal.toLocaleString()}đ</div></div>
        <div className="flex justify-between"><div>Phí vận chuyển</div><div>{shippingFee ? shippingFee.toLocaleString()+"đ":"Miễn phí"}</div></div>
        <div className="flex justify-between font-bold mt-2"><div>Tổng</div><div>{total.toLocaleString()}đ</div></div>
      </div>
    </div>
  );
}
