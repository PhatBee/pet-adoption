// src/pages/OrderPage.jsx
import { useState } from "react";
import NavbarOrder from "../components/order/NavbarOrder";
import OrderCard from "../components/order/OrderCard";

// Fake data
const ordersMock = [
  {
    id: 1,
    status: "pending",
    products: [
      { id: 101, name: "Laptop Asus", price: 15000000, quantity: 1, image: "https://via.placeholder.com/80" },
      { id: 102, name: "Chuột Logitech", price: 500000, quantity: 2, image: "https://via.placeholder.com/80" }
    ],
    total: 16000000,
    isReviewed: false
  },
  {
    id: 2,
    status: "delivered",
    products: [
      { id: 103, name: "Tai nghe Sony", price: 2000000, quantity: 1, image: "https://via.placeholder.com/80" }
    ],
    total: 2000000,
    isReviewed: true
  }
];

const OrderListPage = () => {
  const [status, setStatus] = useState("pending");

  const handleReorder = (order) => {
    console.log("Mua lại đơn hàng:", order.id);
  };

  const handleReview = (order) => {
    console.log("Đánh giá / Xem đánh giá:", order.id);
  };

  const filteredOrders = ordersMock.filter((o) => o.status === status);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h1>

      {/* Tabs trạng thái */}
      <NavbarOrder currentStatus={status} onChange={setStatus} />

      {/* Danh sách đơn hàng */}
      <div className="mt-5">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onReorder={handleReorder}
              onReview={handleReview}
            />
          ))
        ) : (
          <p className="text-gray-500">Không có đơn hàng nào.</p>
        )}
      </div>
    </div>
  );
};

export default OrderListPage;
