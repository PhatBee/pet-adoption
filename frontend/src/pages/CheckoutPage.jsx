import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCheckoutData, placeOrder } from "../store/orderSlice";
import AddressSelector from "../components/checkout/AddressSelector";
import PaymentMethod from "../components/checkout/PaymentMethod";
import OrderSummary from "../components/checkout/OrderSummary";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, addresses, isLoading, error, lastOrder } = useSelector((s) => s.order || {});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    dispatch(fetchCheckoutData());
  }, [dispatch]);

  useEffect(() => {
    if (addresses && addresses.length && !selectedAddress) {
      const d = addresses.find(a=> a.isDefault) || addresses[0];
      setSelectedAddress(d);
    }
  }, [addresses, selectedAddress]);

  useEffect(() => {
    if (lastOrder) {
      // If redirectUrl present (VNPAY)
      if (lastOrder.redirectUrl) {
        window.location.href = lastOrder.redirectUrl;
        return;
      }
      toast.success("Đặt hàng thành công");
      navigate(`/orders/${lastOrder.orderId || lastOrder.order?._id || ""}`);
    }
  }, [lastOrder, navigate]);

  const handlePlaceOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) return toast.error("Giỏ hàng trống");
    const address = selectedAddress;
    if (!address) return toast.error("Vui lòng chọn địa chỉ giao hàng");

    try {
      await dispatch(placeOrder({ shippingAddress: address, paymentMethod })).unwrap();
      // success handled in useEffect above
    } catch (err) {
      toast.error(err || "Đặt hàng thất bại");
    }
  };

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  if (!cart) return <div className="p-6">Giỏ hàng trống</div>;

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <AddressSelector addresses={addresses} value={selectedAddress} onChange={setSelectedAddress} />
        <div className="border rounded p-4 bg-white">
          <h4 className="font-semibold mb-3">Sản phẩm</h4>
          <div className="space-y-3">
            {cart.items.map(it => (
              <div key={it.product._id} className="flex items-center gap-3">
                <img src={it.product.thumbnail} className="w-16 h-16 object-cover rounded" alt={it.product.name} />
                <div className="flex-1">
                  <div className="font-medium">{it.product.name}</div>
                  <div className="text-sm text-gray-500">x{it.quantity} • {it.product.price.toLocaleString()}đ</div>
                </div>
                <div>{(it.product.price * it.quantity).toLocaleString()}đ</div>
              </div>
            ))}
          </div>
        </div>

        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />

      </div>

      <aside>
        <OrderSummary items={cart.items} />
        <div className="mt-4">
          <button onClick={handlePlaceOrder} className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700">Đặt hàng</button>
        </div>
      </aside>
    </div>
  );
}
