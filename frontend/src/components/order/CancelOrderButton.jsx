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

  return (
    <div className="flex justify-end items-center mt-2">
      {cancellableStatuses.includes(order.status) && (
        <button
          onClick={handleCancelRequest}
          className="px-3 py-1 text-xs text-black rounded-md border:bg-black-600 transition-colors"
        >
          Hủy đơn
        </button>
      )}

      {order.status === "cancel_requested" && (
        <p className="text-yellow-600 text-xs mt-1 italic">
          Yêu cầu hủy đơn đang chờ xử lý
        </p>
      )}
    </div>
  );
}
