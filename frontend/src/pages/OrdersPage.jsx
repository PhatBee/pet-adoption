// src/pages/OrdersPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders, resetOrders } from "../store/orderSlice";
import { fetchOrderDetail } from "../store/orderDetailSlice";
import OrderCard from "../components/order/OrderCard";
import CancelOrderButton from "../components/order/CancelOrderButton";
import { useNavigate } from "react-router-dom";
import { List, Card, Button, Spin, Empty, Tabs, Tag } from "antd";

export default function OrdersPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, page, limit, hasMore, isLoading } = useSelector(s => s.order);

  // Tab state
  const [activeTabKey, setActiveTabKey] = useState('all');

  // sentinel ref for intersection observer
  const sentinelRef = useRef(null);

  // keep a ref to avoid calling loadMore too frequently (simple throttle)
  const lastLoadRef = useRef(0);
  const THROTTLE_MS = 800;

  // Fetch first page when tab changes (and reset store)
  useEffect(() => {
    dispatch(resetOrders());
    const statusToFetch = activeTabKey === 'all' ? null : activeTabKey;
    dispatch(fetchMyOrders({ page: 1, limit: 10, status: statusToFetch }));
    // scroll to top when switching tab (optional)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [dispatch, activeTabKey]);

  // loadMore wrapped with useCallback so observer has stable reference
  const loadMore = useCallback(() => {
    // throttle
    const now = Date.now();
    if (now - lastLoadRef.current < THROTTLE_MS) return;
    lastLoadRef.current = now;

    if (!isLoading && hasMore) {
      const statusToFetch = activeTabKey === 'all' ? null : activeTabKey;
      dispatch(fetchMyOrders({ page: page + 1, limit, status: statusToFetch }));
    }
  }, [dispatch, isLoading, hasMore, page, limit, activeTabKey]);

  // IntersectionObserver setup
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '200px', // preload earlier (200px before visible)
        threshold: 0.1
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, sentinelRef]);

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

  // Tabs items
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

      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        items={tabItems.map((t) => ({ key: t.key, label: t.label }))}
      />

      <div className="grid grid-cols-1 gap-4">
        {items.length === 0 && !isLoading ? (
          <div className="p-6 bg-white rounded text-center">Bạn chưa có đơn hàng nào.</div>
        ) : (
          items.map(o => (
            <OrderCard key={o._id} order={o} onView={handleView} />
          ))
        )}
      </div>

      {/* Loading indicator */}
      <div className="mt-4 flex justify-center">
        {isLoading && (
          <div className="py-4">
            <Spin />
          </div>
        )}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} />

      {/* Fallback button for manual loading / accessibility */}
      <div className="mt-4 flex justify-center">
        {hasMore ? (
          <Button onClick={loadMore} loading={isLoading} aria-label="Tải thêm đơn hàng">
            Xem thêm
          </Button>
        ) : (
          items.length > 0 && <div>Đã hết đơn</div>
        )}
      </div>
    </div>
  );
}
