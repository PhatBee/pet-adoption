import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCheckoutData, placeOrder } from "../store/orderSlice";
import AddressSelector from "../components/checkout/AddressSelector";
import PaymentMethod from "../components/checkout/PaymentMethod";
import OrderSummary from "../components/checkout/OrderSummary";
import { toast } from "react-toastify";
// Thêm import useLocation
import { useNavigate, useLocation } from "react-router-dom"; 

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Dùng useLocation để lấy state được truyền qua
  const location = useLocation();
  const itemsFromCart = location.state?.itemsToCheckout;
  
  const { cart, addresses, isLoading, error, lastOrder } = useSelector((s) => s.order || {});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

   // 2. Quyết định xem nên hiển thị sản phẩm nào
  // Ưu tiên sản phẩm được chọn từ giỏ hàng, nếu không có thì dùng cả giỏ hàng (trường hợp vào thẳng checkout)
  const itemsToDisplay = itemsFromCart || cart?.items || [];

  // useEffect(() => {
  //   // Chỉ fetch dữ liệu (địa chỉ, etc.) nếu không có sẵn
  //   if (!addresses || addresses.length === 0) {
  //     dispatch(fetchCheckoutData());
  //   }
  // }, [dispatch, addresses]);


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
    if (itemsToDisplay.length === 0) return toast.error("Không có sản phẩm để đặt hàng");
    if (!selectedAddress) return toast.error("Vui lòng chọn địa chỉ giao hàng");

    try {
      // 3. Truyền `itemsToDisplay` vào action
      await dispatch(
        placeOrder({
          shippingAddress: selectedAddress,
          paymentMethod,
          items: itemsToDisplay, // Gửi danh sách sản phẩm đã chọn
        })
      ).unwrap();
    } catch (err) {
      toast.error(err || "Đặt hàng thất bại");
    }
  };

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  // if (!cart) return <div className="p-6">Giỏ hàng trống</div>;

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6"> {/* Tăng khoảng cách */}
        <AddressSelector addresses={addresses} value={selectedAddress} onChange={setSelectedAddress} />

        {/* Phần hiển thị sản phẩm */}
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          <h4 className="font-semibold text-lg mb-4">Sản phẩm</h4>
          <div className="space-y-4">
            {itemsToDisplay.map((it) => (
              <div key={it.product._id} className="flex items-center gap-4">
                <img src={it.product.thumbnail} className="w-16 h-16 object-cover rounded-md" alt={it.product.name} />
                <div className="flex-1">
                  <div className="font-medium">{it.product.name}</div>
                  <div className="text-sm text-gray-500">x{it.quantity} • {it.product.price.toLocaleString()}đ</div>
                </div>
                <div className="font-semibold">{(it.product.price * it.quantity).toLocaleString()}đ</div>
              </div>
            ))}
          </div>
        </div>

        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />

      </div>

       <aside className="sticky top-6"> {/* Làm cho summary cố định khi cuộn */}
        <OrderSummary items={itemsToDisplay} />
        <div className="mt-4">
          <button onClick={handlePlaceOrder} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
            Đặt hàng
          </button>
        </div>
      </aside>
    </div>
  );
}
