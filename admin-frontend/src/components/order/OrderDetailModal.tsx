// src/components/admin/OrderDetailModal.jsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector, RootState } from "../../store/store";
import { fetchOrderById, clearSelectedOrder, updateOrderStatus, Order } from "../../store/slices/adminOrderSlice";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const dispatch = useAppDispatch();
  const { selectedOrder, detailLoading, updating } = useAppSelector((s: RootState) => s.adminOrders);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [dispatch, orderId]);

  if (detailLoading || !selectedOrder) return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded">Đang tải...</div>
    </div>
  );

  const doUpdate = async (status: string) => {
    if (!window.confirm(`Cập nhật trạng thái sang ${status}?`)) return;
    await dispatch(updateOrderStatus({ id: selectedOrder._id, status })).unwrap();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-3xl rounded p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Chi tiết đơn #{selectedOrder._id.slice(-8)}</h3>
          <button onClick={onClose}>&times;</button>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-2">
          <div>
            <p><b>Người đặt:</b> {selectedOrder.shippingAddress.fullName}</p>
            <p><b>SĐT:</b> {selectedOrder.shippingAddress?.phone}</p>
            <p><b>Địa chỉ:</b> {selectedOrder.shippingAddress?.street + ", " + selectedOrder.shippingAddress.ward + ", " + selectedOrder.shippingAddress.district + ", " + selectedOrder.shippingAddress.city}</p>
          </div>
          <div>
            <p><b>Trạng thái:</b> <OrderStatusBadge status={selectedOrder.status} /></p>
            <p><b>Thanh toán:</b> {selectedOrder.paymentMethod}</p>
            {/* <p><b>Phí ship:</b> {(selectedOrder.shippingFee || 0).toLocaleString()}₫</p> */}
            <p><b>Tổng tiền:</b> <span className="text-lg font-semibold text-blue-700">{(selectedOrder.total || 0).toLocaleString()}₫</span></p>
          </div>
        </div>

        <h4 className="mt-4 font-semibold">Sản phẩm</h4>
        <div className="mt-2 border rounded">
          {selectedOrder.items?.map((it: { productSnapshot?: any, quantity: number }, index: number) => (
            <div key={it.productSnapshot?._id || index} className="flex justify-between items-center border-b last:border-b-0 p-2">
              <div className="flex items-center gap-3">
                <img
                  src={it.productSnapshot?.thumbnail || "/placeholder.png"}
                  alt={it.productSnapshot?.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{it.productSnapshot?.name}</div>
                  <div className="text-sm text-gray-600">{it.quantity} × {it.productSnapshot?.price.toLocaleString()}₫</div>
                </div>
              </div>
              <div className="font-semibold">{(it.productSnapshot?.price * it.quantity).toLocaleString()}₫</div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Lịch sử trạng thái</h4>
          <ul className="mt-2 divide-y">
            {selectedOrder.orderStatusHistory?.length ? (
              selectedOrder.orderStatusHistory.map((h: { status: string, changedAt: Date | string }, idx: number) => (
                <li key={idx} className="py-2 flex justify-between">
                  <div className="font-medium">{h.status}</div>
                  <div className="text-gray-500 text-sm">{new Date(h.changedAt).toLocaleString()}</div>
                </li>
              ))
            ) : (
              <li className="py-2 text-sm text-gray-500">Chưa có lịch sử trạng thái</li>
            )}
          </ul>

          {/* Last updated (nếu bạn có trường statusUpdatedAt) */}
          {selectedOrder.statusUpdatedAt && (
            <p className="mt-3 text-sm text-gray-600">
              Cập nhật lần cuối: {new Date(selectedOrder.statusUpdatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
