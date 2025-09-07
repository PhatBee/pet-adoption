export default function ProductCard({ product }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition">
      <img
        src={product.thumbnail}
        alt={product.name}
        className="w-full h-40 object-cover rounded-md"
      />
      <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
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
