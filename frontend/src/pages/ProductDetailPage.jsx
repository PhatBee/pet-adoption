import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
import ProductSlider from "../components/product/ProductSlider";
import ErrorPage from "./ErrorPage"; // 1. Import trang lỗi
import { selectIsAuthenticated } from "../store/authSlice";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const location = useLocation(); // 3. Lấy vị trí hiện tại
  const navigate = useNavigate(); // 2. Khởi tạo hook useNavigate
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { product, reviews, reviewStats, relatedProducts, isLoading, error } = useSelector((s) => s.productDetail || {});
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

    // --- ⭐ KIỂM TRA XÁC THỰC TẠI ĐÂY ---
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiếp tục");
      // Chuyển hướng đến trang đăng nhập và lưu lại trang này
      navigate('/login', { state: { from: location } });
      return; 
    }
    // --- KẾT THÚC KIỂM TRA ---

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


    // --- ⭐ KIỂM TRA XÁC THỰC TẠI ĐÂY ---
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để tiếp tục");
      // Chuyển hướng đến trang đăng nhập và lưu lại trang này
      navigate('/login', { state: { from: location } });
      return; 
    }
    // --- KẾT THÚC KIỂM TRA ---

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
  if (error) return <ErrorPage statusCode="500" title="Lỗi máy chủ" message={error} />;
  if (!product) return null;

  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* --- Phần thông tin chính --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageCarousel images={(product.images && product.images.length) ? product.images : [product.thumbnail]} />
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              {product.name}
            </h1>

            {/* Hiển thị viewCount và soldCount */}
            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" /></svg>
                <span>{(product.viewCount || 0).toLocaleString()} lượt xem</span>
              </div>

              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4" /></svg>
                <span>{(product.soldCount || 0).toLocaleString()} đã bán</span>
              </div>
            </div>

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
              <div className="ml-auto">
                <WishlistButton product={product} />
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                Dành cho:
                <Link
                  to={`/products?pet=${product.pet?._id}`}
                  className="ml-1 font-semibold text-blue-600 hover:underline"
                >
                  {product.pet?.name}
                </Link>
              </p>
              <p>
                Danh mục:
                <Link
                  to={`/products?category=${product.category?._id}`}
                  className="ml-1 font-semibold text-blue-600 hover:underline"
                >
                  {product.category?.name}
                </Link>
              </p>
            </div>
            <p className="mt-4 text-gray-700 text-justify">{product.shortDescription}</p>
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
                <p className="text-gray-700 mt-2 whitespace-pre-line text-justify">{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>
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
      <ProductSlider
        title={`Sản phẩm cùng thể loại ${product.category?.name}`}
        products={relatedProducts.byCategory}
      />
      <ProductSlider
        title={`Dành cho ${product.pet?.name} khác`}
        products={relatedProducts.byPet}
      />
    </div>

  );
}

