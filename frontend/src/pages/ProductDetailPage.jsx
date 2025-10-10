import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import ProductSpecs from "../components/product/ProductSpecs";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 2. Khởi tạo hook useNavigate
  const { product, reviews, reviewStats, isLoading, error } = useSelector((s) => s.productDetail || {});
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

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
  
  // --- 3. TẠO HÀM MỚI handleBuyNow ---
  const handleBuyNow = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    // Tạo một mảng chứa duy nhất sản phẩm hiện tại,
    // với cấu trúc giống hệt như khi truyền từ trang giỏ hàng.
    const itemToCheckout = [
      {
        product: product,
        quantity: qty,
      },
    ];

    // Dùng navigate để chuyển trang và đính kèm dữ liệu
    navigate('/checkout', { state: { itemsToCheckout: itemToCheckout } });
  };

  if (isLoading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">Lỗi: {error}</div>;
  if (!product) return null;

  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* --- Phần thông tin chính --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageCarousel images={(product.images && product.images.length) ? product.images : [product.thumbnail]} />
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {product.name}
            <WishlistButton product={product} />
          </h1>
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
            <p>Dành cho: <Link to={`/pets/${product.pet?.name}`} className="font-semibold text-blue-600 hover:underline">{product.pet?.name}</Link></p>
            <p>Danh mục: <Link to={`/categories/${product.category?.name}`} className="font-semibold text-blue-600 hover:underline">{product.category?.name}</Link></p>
          </div>
          <p className="mt-4 text-gray-700">{product.shortDescription}</p>
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold">Số lượng:</span>
              <QuantitySelector value={qty} onChange={setQty} min={1} max={product.stock || 1} />
              <StockBadge stock={product.stock} />
            </div>

            {/* --- 4. THÊM NÚT MUA NGAY --- */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-100 text-blue-800 py-3 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-semibold text-lg transition-colors border border-blue-600"
                disabled={product.stock <= 0}
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold text-lg transition-colors"
                disabled={product.stock <= 0}
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. Phần Tabs thông tin chi tiết --- */}
      <div className="mt-12">
        <div className="border-b">
          <nav className="flex gap-4">
            <button onClick={() => setActiveTab('description')} className={`py-2 px-4 font-semibold ${activeTab === 'description' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Mô tả</button>
            <button onClick={() => setActiveTab('specs')} className={`py-2 px-4 font-semibold ${activeTab === 'specs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Thông số</button>
            <button onClick={() => setActiveTab('reviews')} className={`py-2 px-4 font-semibold ${activeTab === 'reviews' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Đánh giá ({reviewStats.count})</button>
          </nav>
        </div>
        <div className="mt-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
                <p className="text-gray-700 mt-2 whitespace-pre-line">{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
            </div>
          )}
          {activeTab === 'specs' && (
            <ProductSpecs product={product} />
          )}
          {activeTab === 'reviews' && (
            <ReviewList reviews={reviews} />
          )}
        </div>
      </div>
    </div>
  );
}

