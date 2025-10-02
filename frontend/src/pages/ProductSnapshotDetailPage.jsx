import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductSnapshot, clearSnapshot } from "../store/orderSnapshotSlice";

export default function ProductSnapshotDetail() {
  const { orderId, productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { snapshot, currentProductId, isLoading } = useSelector((s) => s.snapshot);

  useEffect(() => {
    dispatch(fetchProductSnapshot({ orderId, productId }));
    return () => dispatch(clearSnapshot());
  }, [dispatch, orderId, productId]);

  if (isLoading) return <p className="text-center">Đang tải...</p>;
  if (!snapshot) return <p className="text-center">Không có dữ liệu snapshot</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{snapshot.name}</h2>

      <div className="flex gap-6">
        <img
          src={snapshot.thumbnail || "/no-image.png"}
          alt={snapshot.name}
          className="w-60 h-60 object-cover rounded-lg border"
        />

        <div>
          <p className="text-gray-600 mb-2">{snapshot.description}</p>
          <p className="text-lg font-semibold text-red-500">
            Giá tại thời điểm mua: {snapshot.price.toLocaleString()}₫
          </p>
          {snapshot.compareAtPrice > 0 && (
            <p className="line-through text-gray-400">
              {snapshot.compareAtPrice.toLocaleString()}₫
            </p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Danh mục: {snapshot.category}
          </p>

          <button
            onClick={() => navigate(`/products/${snapshot.slug}`)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Xem sản phẩm hiện tại
          </button>
        </div>
      </div>
    </div>
  );
}
