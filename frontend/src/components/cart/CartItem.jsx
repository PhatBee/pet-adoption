// src/components/CartItem.jsx
import React from "react";
import QuantitySelector from "../product/QuantitySelector"; // reuse
import { useDispatch } from "react-redux";
import { updateCartItem, removeCartItem } from "../../store/cartSlice";
import { FiTrash2 } from "react-icons/fi";

export default function CartItem({ item }) {
  // item: { product: {...}, quantity }
  const { product, quantity } = item;
  const dispatch = useDispatch();

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

  return (
    <div className="flex gap-4 p-4 border rounded-md bg-white">
      <img src={product.thumbnail} alt={product.name} className="w-24 h-24 object-cover rounded" />
      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        <div className="text-sm text-gray-500">Giá: <span className="text-red-600 font-bold">{product.price.toLocaleString()}đ</span></div>
        <div className="text-sm text-gray-500">Kho: {product.stock}</div>
        <div className="mt-2 flex items-center gap-3">
          <QuantitySelector value={quantity} onChange={onQtyChange} min={1} max={product.stock || 1} />
          <button className="text-red-500 flex items-center gap-1" onClick={onRemove}>
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
