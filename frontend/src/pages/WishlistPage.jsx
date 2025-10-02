import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist, removeWishlist } from "../store/wishlistSlice";
import { addCartItem } from "../store/cartSlice";
import { toast } from "react-toastify";
import { Modal } from "antd";
const { confirm } = Modal;

/**
 * WishlistPage
 * - Hiển thị bảng wishlist
 * - Xóa sản phẩm khỏi wishlist
 * - Thêm sản phẩm vào giỏ hàng
 */
export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items: wishlist = [], loading } = useSelector((state) => state.wishlist || {});
  const cartLoading = useSelector((state) => state.cart?.loading);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = async (productId) => {
    confirm({
    title: "Bạn có chắc muốn xóa sản phẩm này?",
    content: "Sản phẩm sẽ bị gỡ khỏi danh sách yêu thích.",
    okText: "Xóa",
    okType: "danger",
    cancelText: "Hủy",
    async onOk() {
      try {
        await dispatch(removeWishlist(productId)).unwrap();
        toast.success("Đã xóa khỏi wishlist");
      } catch (err) {
        toast.error(err?.message || "Xóa thất bại");
      }
    }
  });
};

  const handleAddToCart = async (product) => {
    try {
      await dispatch(addCartItem({ productId: product._id, quantity: 1 })).unwrap();
      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      toast.error(err?.message || "Không thể thêm vào giỏ");
    }
  };

  if (loading) return <p className="text-center py-8">Đang tải danh sách yêu thích...</p>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-4">Sản phẩm yêu thích</h2>

      {(!wishlist || wishlist.length === 0) ? (
        <div className="bg-white shadow rounded p-6 text-center">
          <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
          <a href="/" className="inline-block mt-3 text-sky-600 hover:underline">Mua sắm ngay</a>
        </div>
      ) : (
        <div className="bg-white shadow rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 hidden sm:table-cell">Mô tả</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {wishlist.map((p) => (
                <tr key={p.product._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.product.thumbnail || "/placeholder.png"}
                        alt={p.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <a
                          href={`/products/${p.product.slug}`}
                          className="font-medium text-gray-800 hover:text-sky-600"
                        >
                          {p.name}
                        </a>
                        {/* <div className="text-xs text-gray-400 mt-1">SKU: {p.sku || "-"}</div> */}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xl">{p.product.description || "-"}</p>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {typeof p.product.price === "number" ? p.product.price.toLocaleString() + "đ" : "-"}
                    </div>
                    {p.compareAtPrice > p.price && (
                      <div className="text-xs line-through text-gray-400">{p.product.compareAtPrice.toLocaleString()}đ</div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleAddToCart(p.product)}
                        disabled={p.product.stock <= 0 || cartLoading}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700 transition disabled:opacity-50"
                        title="Thêm vào giỏ hàng"
                      >
                        {/* cart icon (simple) */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                          <circle cx="7" cy="20" r="1" />
                          <circle cx="17" cy="20" r="1" />
                        </svg>
                        <span>Thêm</span>
                      </button>

                      <button
                        onClick={() => handleRemove(p._id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition"
                        title="Xóa khỏi danh sách yêu thích"
                      >
                        {/* trash icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H3a1 1 0 000 2h14a1 1 0 100-2h-2V3a1 1 0 00-1-1H6zm3 6a1 1 0 10-2 0v6a1 1 0 102 0V8zm4 0a1 1 0 10-2 0v6a1 1 0 102 0V8z" clipRule="evenodd" />
                        </svg>
                        <span>Xóa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
