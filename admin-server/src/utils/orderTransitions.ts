const ALLOWED: Record<string, string[]> = {
  pending: ["confirmed", "cancel_requested"],
  confirmed: ["shipping", "cancel_requested"],
  preparing: ["shipping", "cancelled"],
  shipping: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancel_requested: ["cancelled", "confirmed", "preparing"],
  cancelled: [],
  refunded: []
};

export function isAllowedTransition(from: string, to: string): boolean {
  if (!ALLOWED[from]) return false;
  return ALLOWED[from].includes(to);
}
export { ALLOWED };