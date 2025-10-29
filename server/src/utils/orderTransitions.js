const ALLOWED = {
  pending: ["confirmed", "cancel_requested"],
  confirmed: ["shipping", "cancel_requested"],
  shipping: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancel_requested: ["cancelled", "confirmed", "preparing"],
  cancelled: [],
  refunded: []
};

function isAllowedTransition(from, to) {
  if (!ALLOWED[from]) return false;
  return ALLOWED[from].includes(to);
}

module.exports = { ALLOWED, isAllowedTransition };