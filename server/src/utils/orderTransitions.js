const ALLOWED = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancel_requested", "cancelled"],
  preparing: ["shipping", "cancel_requested"],
  shipping: ["delivered"],
  cancel_requested: ["cancelled", "preparing", "confirmed"], //cancelled hoặc từ chối -> trở về preparing
  cancelled: [],
  delivered: []
};

function isAllowedTransition(from, to) {
  if (!ALLOWED[from]) return false;
  return ALLOWED[from].includes(to);
}

module.exports = { ALLOWED, isAllowedTransition };