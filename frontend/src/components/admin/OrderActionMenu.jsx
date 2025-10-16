// src/components/admin/OrderActionMenu.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatus } from "../../store/admin/adminOrderSlice";
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

export default function OrderActionMenu({ order, onUpdateStatus }) {
  const dispatch = useDispatch();
  const updating = useSelector(s => s.adminOrders.updating);
  const nextStatuses = statusFlow[order.status] || [];

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus) return;
    try {
      await dispatch(updateOrderStatus({ id: order._id, status: newStatus })).unwrap();
      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error(err || "Cập nhật thất bại");
    } finally {
      // reset select back to placeholder
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
