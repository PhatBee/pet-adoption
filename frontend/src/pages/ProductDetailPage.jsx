// src/pages/ProductDetailPage.jsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axiosClient";
// import ProductDetail from "../components/ProductDetail";

// export default function ProductDetailPage() {
//   const { id } = useParams();
//   const [product, setProduct] = useState(null);
//   const [qty, setQty] = useState(1);

//   useEffect(() => {
//     api.get(`/products/${id}`).then((res) => setProduct(res.data));
//   }, [id]);

//   if (!product) return <p>Loading...</p>;

//   return <ProductDetail product={product} qty={qty} setQty={setQty} />;
// }

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
// optional: cart action
// import { addItem as addCartItem } from "../features/cart/cartSlice"; // nếu bạn có cart slice

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { product, isLoading, error } = useSelector((s) => s.productDetail || {});
  const [qty, setQty] = useState(1);

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
    return () => dispatch(clearProduct());
  }, [dispatch, slug]);

  useEffect(() => {
    if (product && product.stock !== undefined) {
      setQty(product.stock > 0 ? 1 : 0);
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
          <div className="flex items-center gap-3 mt-2">
            <div className="text-2xl text-red-600 font-semibold">{product.price.toLocaleString()}đ</div>
            {product.compareAtPrice > product.price && (
              <div className="text-gray-500 line-through">{product.compareAtPrice.toLocaleString()}đ</div>
            )}
            {discountPercent > 0 && <div className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">{discountPercent}% giảm</div>}
          </div>

          <div className="mt-3">
            <Link to={`/category/${encodeURIComponent(product.category || "all")}`} className="text-sm text-blue-600 underline">
              {product.category || "Khác"}
            </Link>
          </div>

          <div className="mt-4">
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <QuantitySelector value={qty} onChange={setQty} min={1} max={product.stock || 1} />
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={product.stock <= 0}
            >
              Thêm vào giỏ
            </button>
          </div>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            {product.name}
            <WishlistButton product={product} />
          </h1>

          <div className="mt-6">
            <h3 className="font-semibold">Mô tả</h3>
            <p className="text-gray-700 mt-2 whitespace-pre-line">{product.description}</p>
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
    </div>
  );
}

