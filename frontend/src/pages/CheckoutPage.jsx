import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCheckoutData, placeOrder } from "../store/orderSlice";
import { selectUser, updateUser } from "../store/authSlice";
import { addAddressApi } from "../api/userApi"; // API để thêm địa chỉ
import AddressSelector from "../components/checkout/AddressSelector";
import PaymentMethod from "../components/checkout/PaymentMethod";
import OrderSummary from "../components/checkout/OrderSummary";
import DiscountSection from "../components/checkout/DiscountSection";
import ErrorPage from "./ErrorPage"; // 1. Import trang lỗi
import { toast } from "react-toastify";
// Thêm import useLocation
import { useNavigate, useLocation } from "react-router-dom";
import AddressModal from "../components/user/AddressModal";
import AddressForm from "../components/user/AddressForm";
import { clearReorder } from "../store/reorderSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1. Dùng useLocation để lấy state được truyền qua
  const location = useLocation();
  const itemsFromCart = location.state?.itemsToCheckout;
  const { items: reorderItems } = useSelector((s) => s.reorder || { items: [] });
  const { cart, addresses, isLoading, error, lastOrder, appliedCoupon, pointsToUse } = useSelector((s) => s.order || {});
  const user = useSelector(selectUser);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // --- THÊM STATE ĐỂ QUẢN LÝ MODAL ĐỊA CHỈ ---
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // 2. Quyết định xem nên hiển thị sản phẩm nào
  // Ưu tiên sản phẩm được chọn từ giỏ hàng, nếu không có thì dùng cả giỏ hàng (trường hợp vào thẳng checkout)
  const itemsToDisplay =
    reorderItems && reorderItems.length > 0
      ? reorderItems
      : itemsFromCart || cart?.items || [];

  const itemsTotal = itemsToDisplay.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    // Vẫn gọi để lấy thông tin giỏ hàng, nhưng phần địa chỉ sẽ dùng từ authSlice
    dispatch(fetchCheckoutData());
  }, [dispatch]);

  // --- TÍNH TOÁN SỐ TIỀN GIẢM GIÁ ---
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (itemsTotal * appliedCoupon.discountValue) / 100;
    } else { // fixed_amount
      couponDiscount = appliedCoupon.discountValue;
    }
    couponDiscount = Math.min(couponDiscount, itemsTotal); // Đảm bảo giảm giá không lớn hơn tổng tiền
  }

  // Giả sử 1 xu = 1đ
  let pointsDiscount = Math.min(pointsToUse, itemsTotal - couponDiscount);

  useEffect(() => {
    if (lastOrder) {
      // If redirectUrl present (VNPAY)
      if (lastOrder.redirectUrl) {
        window.location.href = lastOrder.redirectUrl;
        return;
      }
      toast.success("Đặt hàng thành công");
      navigate(`/orders/${lastOrder.orderId || lastOrder.order?._id || ""}`);
      dispatch(clearReorder());

    }
  }, [lastOrder, navigate]);

  // TẠO CÁC HÀM XỬ LÝ CHO MODAL VÀ FORM 
  const handleOpenAddressModal = () => setIsAddressModalOpen(true);
  const handleCloseAddressModal = () => setIsAddressModalOpen(false);

  const handleAddressFormSubmit = async (formData) => {
    try {
      const response = await addAddressApi(formData);
      // Cập nhật lại danh sách địa chỉ trong Redux auth state
      dispatch(updateUser({ addresses: response.data.addresses }));
      
      // Tự động chọn địa chỉ vừa thêm
      const newAddress = response.data.addresses[response.data.addresses.length - 1];
      setSelectedAddress(newAddress);
      
      toast.success("Thêm địa chỉ mới thành công!");
      handleCloseAddressModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm địa chỉ.");
    }
  };

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
          couponCode: appliedCoupon?.code, // Gửi mã code
          pointsToUse: pointsToUse,       // Gửi số điểm sử dụng
        })
      ).unwrap();
    } catch (err) {
      toast.error(err || "Đặt hàng thất bại");
    }
  };

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <ErrorPage statusCode="500" title="Lỗi máy chủ" message={error} />; 
  // if (!cart) return <div className="p-6">Giỏ hàng trống</div>;

  return (
    // Dùng Fragment <> để bọc trang và modal
    <>
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* --- 4. CẬP NHẬT PROPS CHO AddressSelector --- */}
          <AddressSelector 
            addresses={user?.addresses || []} // Dùng địa chỉ từ authSlice
            value={selectedAddress} 
            onChange={setSelectedAddress}
            onAddNew={handleOpenAddressModal} // Kết nối nút "Thêm mới"
          />

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

        {/* <-- 3. ĐẶT DISCOUNT --> */}
        <DiscountSection
          itemsTotal={itemsTotal}
          userLoyaltyPoints={user?.loyaltyPoints}
        />

        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />
      </div>

      <aside className="sticky top-6"> {/* Làm cho summary cố định khi cuộn */}
        <OrderSummary
          items={itemsToDisplay}
          couponDiscount={couponDiscount}
          pointsDiscount={pointsDiscount}
        />
        <div className="mt-4">
          <button onClick={handlePlaceOrder} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
            Đặt hàng
          </button>
        </div>
      </aside>
    </div>

    {/* --- 5. RENDER MODAL Ở DƯỚI CÙNG --- */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={handleCloseAddressModal}
        title="Thêm địa chỉ giao hàng mới"
      >
        <AddressForm
          onSubmit={handleAddressFormSubmit}
          onCancel={handleCloseAddressModal}
        />
      </AddressModal>
    </>

  );
}
