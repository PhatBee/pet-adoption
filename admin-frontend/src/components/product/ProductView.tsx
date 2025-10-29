import React from 'react';
import { Product } from '../../types/next';

interface ProductViewProps {
  product: Product;
  onSwitchToEdit: () => void;
}

const ProductView: React.FC<ProductViewProps> = ({ product, onSwitchToEdit }) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        <img
          src={`${product.thumbnail}`}
          alt={product.name}
          className="w-32 h-32 object-cover rounded-lg shadow-md"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500 mt-1">ID: {product._id}</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-indigo-600">
              {product.price.toLocaleString()} VNĐ
            </span>
            {product.compareAtPrice > 0 && (
              <span className="text-lg text-gray-500 line-through">
                {product.compareAtPrice.toLocaleString()} VNĐ
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
        <div><strong>Danh mục:</strong> {(product.category as any)?.name}</div>
        <div><strong>Thú cưng:</strong> {(product.pet as any)?.name}</div>
        <div><strong>Tồn kho:</strong> {product.stock}</div>
        <div><strong>Thương hiệu:</strong> {product.brand || '—'}</div>
        <div><strong>Đã bán:</strong> {product.soldCount || 0}</div>
        <div><strong>Lượt xem:</strong> {product.viewCount || 0}</div>
      </div>

      {product.shortDescription && (
        <div>
          <p className="font-medium text-gray-700">Mô tả ngắn:</p>
          <p className="text-gray-600 mt-1">{product.shortDescription}</p>
        </div>
      )}

      {product.description && (
        <div>
          <p className="font-medium text-gray-700">Mô tả chi tiết:</p>
          <div
            className="prose prose-sm text-gray-600 mt-1 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {product.images && product.images.length > 0 && (
        <div>
          <p className="font-medium text-gray-700">Hình ảnh:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.images.map((img, i) => (
              <img
                key={i}
                src={`${img}`}
                alt={`Ảnh ${i + 1}`}
                className="w-20 h-20 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-8 border-t pt-4">
        <button
          onClick={onSwitchToEdit}
          className="flex-1 py-2.5 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
        >
          Chỉnh Sửa Sản Phẩm
        </button>
      </div>
    </div>
  );
};

export default ProductView;