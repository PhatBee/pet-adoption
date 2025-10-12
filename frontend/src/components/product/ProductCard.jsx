import { Link } from "react-router-dom";
import WishlistButton from "../wishlist/WishlistButton";

export default function ProductCard({ product }) {
  // Tính toán phần trăm giảm giá
  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="relative group bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} />
      </div>

      {/* Huy hiệu giảm giá */}
      {discountPercent > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPercent}%
        </div>
      )}

      <Link to={`/products/${product.slug}`} className="block">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.slug}`} className="block text-md font-semibold text-gray-800 hover:text-blue-600 truncate no-underline">
          {product.name}
        </Link>
        
        {/* Giá sản phẩm */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg text-red-600 font-bold">
            {product.price.toLocaleString()}đ
          </span>
          {discountPercent > 0 && (
            <span className="line-through text-gray-400 text-sm">
              {product.compareAtPrice.toLocaleString()}đ
            </span>
          )}
        </div>
      </div>
    </div>
  );
}