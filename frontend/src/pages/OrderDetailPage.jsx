// src/pages/OrderDetailPage.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetail, clearOrder } from "../store/orderDetailSlice";
import OrderStatusTimeline from "../components/order/OrderStatusTimeline";
import AddressDisplay from "../components/order/AddressDisplay";
import OrderItemRow from "../components/order/OrderItemRow";
import OrderTotal from "../components/order/OrderTotal"; // reuse from earlier or implement
import ErrorPage from "./ErrorPage"; // 1. Import trang lỗi
import { toast } from "react-toastify";
import { format } from "date-fns";


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
        </div>
      </div>

      <aside>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-3">Thông tin đơn hàng</h4>
          <div className="text-sm text-gray-700">
            <div>Mã đơn: <span className="font-mono">{order._id}</span></div>
            <div>Trạng thái: {order.status}</div>
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
