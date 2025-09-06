import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import ProductGrid from "../components/ProductForm";

export default function HomePage() {
  const [latest, setLatest] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLatest((await api.get("/products/latest")).data);
      setBestsellers((await api.get("/products/bestsellers")).data);
      setMostViewed((await api.get("/products/most-viewed")).data);
      setDiscounts((await api.get("/products/discounts")).data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <ProductGrid title="Sản phẩm mới nhất" products={latest} />
      <ProductGrid title="Sản phẩm bán chạy nhất" products={bestsellers} />
      <ProductGrid title="Sản phẩm được xem nhiều" products={mostViewed} />
      <ProductGrid title="Khuyến mãi cao nhất" products={discounts} />
    </div>
  );
}
