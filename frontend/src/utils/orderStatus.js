// src/utils/orderStatus.js
export const STATUS_LABELS_VI = {
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  cancel_requested: 'Yêu cầu hủy',
  refunded: 'Đã hoàn tiền',
};

export function translateOrderStatus(status, fallback = '') {
  if (!status) return fallback;
  return STATUS_LABELS_VI[status] ?? fallback ?? status;
}
