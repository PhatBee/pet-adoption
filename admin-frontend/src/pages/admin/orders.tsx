import React, { useEffect, useState, ReactElement } from 'react';
import { fetchOrders, setFilters } from '../../store/slices/adminOrderSlice';
import OrderList from '../../components/order/OrderList';
import OrderDetailModal from '../../components/order/OrderDetailModal';
import AdminLayout from '../../components/AdminLayout';
import { NextPageWithLayout } from '../../types/next';
import { useAppDispatch, useAppSelector, RootState } from '../../store/store';

const AdminOrderPage: NextPageWithLayout = () => {
  const dispatch = useAppDispatch();
  const {
    orders,
    loading,
    error,
    filters,
    page,
    total,
    limit,
  } = useAppSelector((s: RootState) => s.adminOrders);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(filters.q || '');

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit, ...filters }));
  }, [dispatch, filters, limit]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setFilters({ q: searchValue }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue, dispatch]);

  const onFilterStatus = (status: string) => dispatch(setFilters({ status }));

  const openDetail = (order: { _id: string }) => {
    setSelectedId(order._id);
  };

  const closeModal = () => {
    setSelectedId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm tên hoặc SĐT khách hàng..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="px-3 py-2 border rounded-md"
        />
        <select
          onChange={(e) => onFilterStatus(e.target.value)}
          value={filters.status}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Xác nhận</option>
          <option value="preparing">Đang chuẩn bị</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao</option>
          <option value="cancelled">Đã hủy</option>
          <option value="refunded">Hoàn tiền</option>
          <option value="cancel_requested">Yêu cầu hủy</option>
        </select>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <OrderList orders={orders} onViewDetail={openDetail} />

      {selectedId && (
        <OrderDetailModal orderId={selectedId} onClose={closeModal} />
      )}
    </div>
  );
};

AdminOrderPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminOrderPage;