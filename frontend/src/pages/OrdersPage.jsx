
// src/pages/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders, resetOrders } from "../store/orderSlice";
import { fetchOrderDetail } from "../store/orderDetailSlice";
import OrderCard from "../components/order/OrderCard";
import { useNavigate } from "react-router-dom";
import { List, Card, Button, Spin, Empty, Tabs, Tag } from "antd";
  
// import OrderDetailModal from "../components/OrderDetailModal";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, page, limit, hasMore, isLoading } = useSelector(s => s.order);

  // 1. State để theo dõi tab đang được chọn. Mặc định là 'Tất cả'
  const [activeTabKey, setActiveTabKey] = useState('all');

  // 2. useEffect này sẽ chạy lại mỗi khi bạn click vào một tab mới
  useEffect(() => {
    // Luôn reset danh sách cũ khi chuyển tab
    dispatch(resetOrders());
    
    // Nếu tab là 'all', không gửi status. Nếu không, gửi key của tab.
    const statusToFetch = activeTabKey === 'all' ? null : activeTabKey;
    
    dispatch(fetchMyOrders({ page: 1, limit: 10, status: statusToFetch }));
  }, [dispatch, activeTabKey]); // Phụ thuộc vào tab đang được chọn

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const statusToFetch = activeTabKey === 'all' ? null : activeTabKey;
      // Gửi kèm status khi "Xem thêm"
      dispatch(fetchMyOrders({ page: page + 1, limit, status: statusToFetch }));
    }
  };

  const handleView = (orderId) => {
    dispatch(fetchOrderDetail(orderId))
    .unwrap()
    .then(() => {
      navigate(`/orders/${orderId}`);
    })
    .catch((err) => {
      console.error("Không lấy được chi tiết đơn:", err);
    });
  };

    // Thêm tab "Tất cả" vào danh sách
  const tabItems = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "confirmed", label: "Đã xác nhận" },
    { key: "shipping", label: "Đang giao" },
    { key: "delivered", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h2>
      
      {/* 3. Cập nhật Tabs để sử dụng state và hàm mới */}
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={tabItems.map((t) => ({ key: t.key, label: t.label }))}
      />

      <div className="grid grid-cols-1 gap-4">
        {items.length === 0 && !isLoading ? (
          <div className="p-6 bg-white rounded text-center">Bạn chưa có đơn hàng nào.</div>
        ) : (
          items.map(o => <OrderCard key={o._id} order={o} onView={handleView} />)
        )}
      </div>

      <div className="mt-6 text-center">
        {isLoading ? (
          <button className="px-4 py-2 bg-gray-200 rounded">Đang tải...</button>
        ) : hasMore ? (
          <button onClick={loadMore} className="px-4 py-2 bg-blue-600 text-white rounded">Xem thêm</button>
        ) : (
          <div className="text-sm text-gray-500">Không còn đơn hàng</div>
        )}
      </div>

    </div>
  );
}
