// utils/orderStatus.js
const STATUS_LABELS_VI = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  preparing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  cancel_requested: 'Yêu cầu hủy',
  refunded: 'Đã hoàn tiền',
};

/**
 * Dịch status code sang nhãn ngôn ngữ (hiện tại: tiếng Việt)
 * @param {string} status - status code từ order.status
 * @param {object} [opts] - tuỳ chọn (locale, fallback,...)
 * @returns {string}
 */
function translateOrderStatus(status, opts = {}) {
  if (!status) return opts.fallback || '';
  // hiện tại chỉ tiếng vi, có thể mở rộng bằng opts.locale
  const map = STATUS_LABELS_VI;
  return map[status] ?? (opts.fallback ?? status);
}

module.exports = {
  STATUS_LABELS_VI,
  translateOrderStatus,
};
