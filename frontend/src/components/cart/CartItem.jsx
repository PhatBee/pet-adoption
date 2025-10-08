// src/components/CartItem.jsx
import React from "react";
import QuantitySelector from "../product/QuantitySelector"; // reuse
// Cập nhật import: thêm useSelector và action mới
import { useDispatch, useSelector } from "react-redux";
import { updateCartItem, removeCartItem, toggleSelectItem } from "../../store/cartSlice";
import { FiTrash2 } from "react-icons/fi";

// Nhận thêm prop `isLoading`
export default function CartItem({ item, isLoading }) {
  // item: { product: {...}, quantity }
  const { product, quantity } = item;
  const dispatch = useDispatch();

  // 1. Lấy mảng ID các sản phẩm đã chọn từ store
  const { selectedItems } = useSelector((state) => state.cart);

  // 2. Kiểm tra xem sản phẩm này có đang được chọn không
  const isSelected = selectedItems.includes(product._id);

  const onQtyChange = (newQty) => {
    // prevent sending if same
    if (newQty === quantity) return;
    // ensure not exceed stock
    const finalQty = Math.min(newQty, product.stock || newQty);
    dispatch(updateCartItem({ productId: product._id, quantity: finalQty }));
  };

  const onRemove = () => {
    if (!product) return;
    if (!window.confirm(`Bạn chắc chắn xóa ${product.name} khỏi giỏ?`)) return;
    dispatch(removeCartItem(product._id))
  };

  // 3. Hàm xử lý khi tick/bỏ tick checkbox
  const handleToggleSelect = () => {
    dispatch(toggleSelectItem(product._id));
  };

  return (
    <div className="flex gap-4 p-4 border rounded-md bg-white items-center">
      {/* Bọc checkbox và ảnh */}
      <div className="flex items-center gap-4">
        {/* 4. Thêm checkbox */}
        <input 
            type="checkbox" 
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={isSelected}
            onChange={handleToggleSelect}
        />
        <img src={product.thumbnail} alt={product.name} className="w-24 h-24 object-cover rounded" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        <div className="text-sm text-gray-500">Giá: <span className="text-red-600 font-bold">{product.price.toLocaleString()}đ</span></div>
        <div className="text-sm text-gray-500">Kho: {product.stock}</div>
        <div className="mt-2 flex items-center gap-3">
          {/* Vô hiệu hóa QuantitySelector khi đang loading */}
          <QuantitySelector value={quantity} onChange={onQtyChange} min={1} max={product.stock || 1} disabled={isLoading} />

          {/* Vô hiệu hóa nút Xóa khi đang loading */}
          <button className="text-red-500 flex items-center gap-1 disabled:opacity-50" onClick={onRemove} disabled={isLoading}>
            <FiTrash2 /> <span>Xóa</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col justify-between items-end">
        <div className="font-semibold">{(product.price * quantity).toLocaleString()}đ</div>
      </div>
    </div>
  );
}
