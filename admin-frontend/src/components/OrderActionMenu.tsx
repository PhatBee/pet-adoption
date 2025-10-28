import React, { ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { updateOrderStatus } from "../store/slices/adminOrderSlice";
import { toast } from "react-toastify";

const statusFlow = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  preparing: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancel_requested: ["cancelled", "preparing"],
  cancelled: [],
  refunded: [],
};

type OrderStatus = keyof typeof statusFlow;

interface Order {
  _id: string;
  status: OrderStatus;
}

interface OrderActionMenuProps {
  order: Order;
  onUpdateStatus?: () => void;
}

export default function OrderActionMenu({ order, onUpdateStatus }: OrderActionMenuProps) {
  const dispatch = useAppDispatch();
  const updating = useAppSelector(s => s.adminOrders.updating);
  const nextStatuses = statusFlow[order.status] || [];

  const handleChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (!newStatus) return;
    try {
      await dispatch(updateOrderStatus({ id: order._id, status: newStatus })).unwrap();
      toast.success("Cập nhật trạng thái thành công");
    } catch (err: any) {
      const errorMessage = (err as Error)?.message || String(err) || "Cập nhật thất bại";
      toast.error(errorMessage);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div>
      <select
        onChange={handleChange}
        disabled={updating || nextStatuses.length === 0}
        defaultValue=""
        className="border px-2 py-1 rounded text-sm bg-white"
      >
        <option value="">Cập nhật</option>
        {nextStatuses.map(s => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};
