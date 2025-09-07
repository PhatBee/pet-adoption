// import { useEffect, useState } from "react";
// import api from "../api/axiosClient";
// import ProductGrid from "../components/ProductForm";

// export default function HomePage() {
//   const [latest, setLatest] = useState([]);
//   const [bestsellers, setBestsellers] = useState([]);
//   const [mostViewed, setMostViewed] = useState([]);
//   const [discounts, setDiscounts] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLatest((await api.get("/products/newest")).data);
//       setBestsellers((await api.get("/products/best-sellers")).data);
//       setMostViewed((await api.get("/products/most-viewed")).data);
//       setDiscounts((await api.get("/products/top-discounts")).data);
//     };
//     fetchData();
//   }, []);

//   return (
//     <div className="p-6">
//       <ProductGrid title="Sản phẩm mới nhất" products={latest} />
//       <ProductGrid title="Sản phẩm bán chạy nhất" products={bestsellers} />
//       <ProductGrid title="Sản phẩm được xem nhiều" products={mostViewed} />
//       <ProductGrid title="Khuyến mãi cao nhất" products={discounts} />
//     </div>
//   );
// }

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/productSlice";
import ProductSection from "../components/ProductSection";

export default function HomePage() {
  const dispatch = useDispatch();
  const { newest, bestSellers, mostViewed, topDiscounts, isLoading } =
    useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (isLoading) return <p className="text-center">Đang tải...</p>;

  return (
    <div className="container mx-auto px-4">
      <ProductSection title="Sản phẩm mới nhất" products={newest} />
      <ProductSection title="Sản phẩm bán chạy nhất" products={bestSellers} />
      <ProductSection title="Sản phẩm được xem nhiều" products={mostViewed} />
      <ProductSection title="Sản phẩm khuyến mãi cao nhất" products={topDiscounts} />
    </div>
  );
}

