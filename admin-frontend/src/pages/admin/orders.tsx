import React, { useEffect, useState, ReactElement, useRef } from 'react';
import { fetchOrders, setFilters, setPage  } from '../../store/slices/adminOrderSlice';
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

  const isMounted = useRef(false);

  useEffect(() => {
    dispatch(fetchOrders({ page, limit, ...filters }));
  }, [dispatch, filters, limit, page]);

  // change page handler
  const handleChangePage = (newPage: number) => {
    if (newPage < 1) return;
    const lastPage = Math.max(1, Math.ceil((total || 0) / limit));
    if (newPage > lastPage) return;
    // Option 1: dispatch setPage -> useEffect sẽ fetch
    dispatch(setPage(newPage));
  };

  // prev/next helpers
  const lastPage = Math.max(1, Math.ceil((total || 0) / limit));
  const canPrev = page > 1;
  const canNext = page < lastPage;

  useEffect(() => {

    if (!isMounted.current) {
        isMounted.current = true;
        return; 
    }
    const timeout = setTimeout(() => {
      dispatch(setFilters({ q: searchValue }));
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchValue, filters.q, dispatch]);

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

      {/* ------- PAGINATION UI ------- */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Hiển thị <strong>{orders.length}</strong> / <strong>{total}</strong> đơn
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={!canPrev}
            className={`px-3 py-1 rounded border ${canPrev ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}>
            Prev
          </button>

          {/* Simple page numbers: show few pages around current */}
          <div className="flex items-center gap-1">
            {Array.from({ length: lastPage }, (_, i) => i + 1)
              // hạn chế hiển thị quá nhiều trang: chỉ show window +/-2
              .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === lastPage)
              .map((p, idx, arr) => {
                // insert ellipsis
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  return <span key={`dots-${p}`} className="px-2">...</span>;
                }
                return (
                  <button
                    key={p}
                    onClick={() => handleChangePage(p)}
                    className={`px-3 py-1 rounded border ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {p}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={!canNext}
            className={`px-3 py-1 rounded border ${canNext ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}>
            Next
          </button>
        </div>
      </div>
      {/* ------------------------------- */}

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