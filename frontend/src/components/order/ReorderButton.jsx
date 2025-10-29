import React from "react";
import { useDispatch } from "react-redux";
import { fetchReorderItems } from "../../store/reorderSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ReorderButton({ order }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleReorder = async () => {
        try {
            // 1. Gọi thunk, giả định nó trả về { available, unavailable }
            //    và slice reorderSlice sẽ tự động lưu `available` vào state.reorderItems
            const { available, unavailable } = await dispatch(fetchReorderItems(order._id)).unwrap();


            // 2. Hiển thị thông báo chi tiết cho các sản phẩm KHÔNG có sẵn
            if (unavailable && unavailable.length > 0) {
                // Tạo một danh sách thông báo
                const unavailableMsgs = unavailable.map(
                    it => `"${it.name}" (${it.reason})`
                ).join("\n"); // Nối các thông báo bằng dấu xuống dòng

                // Hiển thị toast.info hoặc warn với thời gian dài hơn để người dùng kịp đọc
                toast.info(
                    <div style={{ whiteSpace: 'pre-line' }}>
                        Một số sản phẩm không thể mua lại:{"\n"}
                        {unavailableMsgs}
                    </div>,
                    {
                        autoClose: 8000, // 8 giây
                        closeOnClick: false,
                    }
                );
            }

            // 3. Kiểm tra xem có sản phẩm nào CÓ THỂ mua lại không
            if (!available || available.length === 0) {
                toast.error("Tất cả sản phẩm trong đơn hàng này hiện không thể mua lại.");
                return;
            }

            // 4. Nếu có, chuyển đến trang thanh toán
            toast.success(`Đã thêm ${available.length} sản phẩm có sẵn vào trang thanh toán.`);
            navigate("/checkout?mode=reorder");

        } catch (err) {
            console.error("Reorder error:", err);
            // Hiển thị lỗi từ backend (nếu có)
            toast.error(err?.message || "Có lỗi xảy ra khi mua lại đơn hàng.");
        }
    };

    return (
        <button
            onClick={handleReorder}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition"        >
            Mua lại
        </button>
    );
}
