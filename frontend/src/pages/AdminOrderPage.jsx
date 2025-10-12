// src/pages/admin/OrderManagementPage.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, fetchOrderById, setFilters, clearSelectedOrder } from "../store/admin/adminOrderSlice";
import OrderList from "../components/admin/OrderList";
import OrderDetailModal from "../components/admin/OrderDetailModal";

export default function AdminOrderPage() {
  const dispatch = useDispatch();
  const { orders, loading, error, filters, page, total, limit } = useSelector(s => s.adminOrders);
  
  const [selectedId, setSelectedId] = useState(null);
  const [searchValue, setSearchValue] = useState(filters.q || "");

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit, ...filters }));
  }, [dispatch, filters, limit]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setFilters({ q: searchValue }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const onFilterStatus = (status) => dispatch(setFilters({ status }));

  const openDetail = (order) => {
    setSelectedId(order._id);
    dispatch(fetchOrderById(order._id));
  };

  const closeModal = () => {
    setSelectedId(null);
    dispatch(clearSelectedOrder());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Tìm tên hoặc SĐT khách hàng..." onChange={(e) => setSearchValue(e.target.value)} className="px-3 py-2 border rounded-md" />
        <select onChange={(e) => onFilterStatus(e.target.value)} value={filters.status} className="px-3 py-2 border rounded-md">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Xác nhận</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
          <option value="refunded">Hoàn tiền</option>
        </select>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <OrderList orders={orders} onViewDetail={openDetail} />

      {selectedId && <OrderDetailModal orderId={selectedId} onClose={closeModal} />}
    </div>
  );
}
