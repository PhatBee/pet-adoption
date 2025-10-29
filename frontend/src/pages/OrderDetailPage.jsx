// src/pages/OrderDetailPage.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetail, clearOrder } from "../store/orderDetailSlice";
import OrderStatusTimeline from "../components/order/OrderStatusTimeline";
import AddressDisplay from "../components/order/AddressDisplay";
import OrderItemRow from "../components/order/OrderItemRow";
import OrderTotal from "../components/order/OrderTotal"; // reuse from earlier or implement
import CancelOrderButton from "../components/order/CancelOrderButton";
import ErrorPage from "./ErrorPage"; // 1. Import trang lỗi
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReorderButton from "../components/order/ReorderButton";
import { fetchReorderItems } from "../store/reorderSlice";
import { useNavigate } from "react-router-dom";

import { translateOrderStatus, STATUS_LABELS_VI } from "../utils/orderStatus";




export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, reviews, isLoading, error } = useSelector(s => s.orderDetail || {});

  useEffect(() => {
    dispatch(fetchOrderDetail(id));
    return () => dispatch(clearOrder());
  }, [dispatch, id]);

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <ErrorPage statusCode="500" title="Lỗi máy chủ" message={error} />;
  if (!order) return null;

  // helper: optional mapping status -> tailwind classes for badge
  const statusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-indigo-100 text-indigo-800';
      case 'shipping': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'cancel_requested': return 'bg-red-50 text-red-700';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <OrderStatusTimeline history={order.orderStatusHistory} />

        <AddressDisplay address={order.shippingAddress} />

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-3">Sản phẩm trong đơn</h4>
          <div className="divide-y">
            {order.items.map((it, idx) => (
              <OrderItemRow
                key={idx}
                item={it}
                orderId={order._id}
                existingReview={reviews && reviews[it.product.toString()] ? reviews[it.product.toString()] : null}

                orderStatus={order.status}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-end gap-3">
            {["pending", "confirmed", "shipping"].includes(order.status) && (
              <CancelOrderButton order={order} />
            )}
            <ReorderButton order={order} />
          </div>
        </div>
      </div>

      <aside>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-3">Thông tin đơn hàng</h4>
          <div className="text-sm text-gray-700">
            <div>Mã đơn: <span className="font-mono">{order._id}</span></div>

            {/* Hiển thị nhãn trạng thái bằng translateOrderStatus */}
            <div>
              Trạng thái:{" "}
              <span className={`inline-block px-2 py-1 text-sm rounded ${statusBadgeClass(order.status)}`}>
                {translateOrderStatus(order.status, order.status)}
              </span>
            </div>
            
            <div>Phương thức: {order.paymentMethod}</div>
            <div>Ngày đặt: {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</div>
            {order.deliveredAt && <div>Ngày giao: {format(new Date(order.deliveredAt), "dd/MM/yyyy HH:mm")}</div>}
          </div>
        </div>

        <div className="mt-4">
          <OrderTotal order={order} />
        </div>
      </aside>
    </div>
  );
}
