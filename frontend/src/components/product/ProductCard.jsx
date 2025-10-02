import { Link } from "react-router-dom";
import WishlistButton from "../wishlist/WishlistButton";

export default function ProductCard({ product }) {
  return (
    <div className="relative bg-white shadow rounded-lg p-4 hover:shadow-lg transition">
      {/* Nút wishlist */}
      <WishlistButton product={product} />

      <Link to={`/products/${product.slug}`}>
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-40 object-cover rounded-md"
        />
      </Link>
      <Link to={`/products/${product.slug}`} className="block mt-2 font-semibold hover:text-blue-600">
        {product.name}
      </Link>
      <p className="text-sm text-gray-500">{product.description}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-red-500 font-bold">
          {product.price.toLocaleString()}đ
        </span>
        {product.compareAtPrice > product.price && (
          <span className="line-through text-gray-400 text-sm">
            {product.compareAtPrice.toLocaleString()}đ
          </span>
        )}
      </div>
    </div>
  );
}
