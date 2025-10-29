import React from "react";
import { useDispatch } from "react-redux";
import { requestCancelOrder } from "../../store/orderSlice";
import { toast } from "react-toastify";

export default function CancelOrderButton({ order }) {
  const dispatch = useDispatch();

  const handleCancelRequest = async () => {
    const confirmed = window.confirm("Bạn có chắc muốn gửi yêu cầu hủy đơn hàng này không?");
    if (!confirmed) return;

    try {
      await dispatch(requestCancelOrder(order._id)).unwrap();
      toast.success("Đã gửi yêu cầu hủy đơn hàng. Vui lòng chờ admin duyệt!");
    } catch (err) {
      toast.error(err || "Không thể gửi yêu cầu hủy");
    }
  };

  // Trạng thái cho phép hủy
  const cancellableStatuses = ["pending", "confirmed", "preparing"];

  if (cancellableStatuses.includes(order.status)) {
    return (
      <button
        onClick={handleCancelRequest}
        className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-sm transition"
      >
        Hủy đơn
      </button>
    );
  }

  if (order.status === "cancel_requested") {
    return (
      <p className="text-orange-600 text-sm italic self-center">
        Đang chờ duyệt hủy
      </p>
    );
  }
  return null;
}
