import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductBySlug, clearProduct } from "../store/productDetailSlice";
import ImageCarousel from "../components/product/ImageCarousel";
import QuantitySelector from "../components/product/QuantitySelector";
import StockBadge from "../components/product/StockBadge";
import { toast } from "react-toastify";
import { addCartItem } from "../store/cartSlice";
import WishlistButton from "../components/wishlist/WishlistButton";
import Rating from "../components/product/Rating";
import ReviewList from "../components/product/ReviewList";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { product, reviews, reviewStats, isLoading, error } = useSelector((s) => s.productDetail || {});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug));
    }
    return () => dispatch(clearProduct());
  }, [dispatch, slug]);

  useEffect(() => {
    if (product && product.stock > 0) {
      setQty(1);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    dispatch(addCartItem({ productId: product._id, quantity: qty }))
      .unwrap()
      .then(() => toast.success("Đã thêm vào giỏ hàng"))
      .catch((err) => toast.error(err));
  };

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  if (!product) return null;

  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: images */}
        <div>
          <ImageCarousel images={(product.images && product.images.length) ? product.images : (product.thumbnail ? [product.thumbnail] : [])} />
        </div>

        {/* Right: info */}
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>

          {/* --- 3. HIỂN THỊ RATING TRUNG BÌNH --- */}
          <div className="mt-3">
            <Rating value={reviewStats.average} text={`(${reviewStats.count} đánh giá)`} />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <div className="text-3xl text-red-600 font-semibold">{product.price.toLocaleString()}đ</div>
            {discountPercent > 0 && (
              <>
                <div className="text-gray-500 line-through">{product.compareAtPrice.toLocaleString()}đ</div>
                <div className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-medium text-sm">-{discountPercent}%</div>
              </>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            {/* --- 4. CẬP NHẬT HIỂN THỊ PET VÀ CATEGORY --- */}
            <p>Dành cho: <Link to={`/pets/${product.pet?.name}`} className="font-semibold text-blue-600 hover:underline">{product.pet?.name}</Link></p>
            <p>Danh mục: <Link to={`/categories/${product.category?.name}`} className="font-semibold text-blue-600 hover:underline">{product.category?.name}</Link></p>
          </div>

          <div className="mt-6 border-t pt-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Số lượng:</span>
              <QuantitySelector value={qty} onChange={setQty} min={1} max={product.stock || 1} />
              <StockBadge stock={product.stock} />
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg transition-colors"
              disabled={product.stock <= 0}
            >
              Thêm vào giỏ hàng
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <div>Đã bán: {product.soldCount || 0}</div>
            <div>Lượt xem: {product.viewCount || 0}</div>
            <div className="mt-2">
              <Link to="/" className="text-blue-500">Quay về trang chủ</Link>
            </div>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold flex items-center gap-2">
        {product.name}
        <WishlistButton product={product} />
      </h1>

      <div className="mt-6">
        <h3 className="font-semibold text-lg">Mô tả sản phẩm</h3>
        <p className="text-gray-700 mt-2 whitespace-pre-line">{product.description}</p>
      </div>

      {/* --- 5. HIỂN THỊ DANH SÁCH REVIEW --- */}
      <div className="mt-10 border-t pt-10">
        <ReviewList reviews={reviews} />
      </div>      
    </div>
  );
}

