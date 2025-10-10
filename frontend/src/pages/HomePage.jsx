import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../store/productSlice";
import ProductSection from "../components/product/ProductSection";

export default function HomePage() {
  const dispatch = useDispatch();
  // const { newest, bestSellers, mostViewed, topDiscounts, isLoading } =
  //   useSelector((state) => state.products);

  // 1. Lấy mảng 'sections' và trạng thái isLoading từ Redux
  const { sections, isLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (isLoading) {
    return <p className="text-center p-10">Đang tải dữ liệu trang chủ...</p>;
  }

  // return (
  //   <div className="container mx-auto px-4">
  //     <ProductSection title="Sản phẩm mới nhất" products={newest} />
  //     <ProductSection title="Sản phẩm bán chạy nhất" products={bestSellers} />
  //     <ProductSection title="Sản phẩm được xem nhiều" products={mostViewed} />
  //     <ProductSection title="Sản phẩm khuyến mãi cao nhất" products={topDiscounts} />
  //   </div>
  // );

  return (
    <div className="container mx-auto px-4">
      {/* 2. Dùng .map() để duyệt qua mảng sections và render */}
      {sections.map((section, index) => (
        <ProductSection
          key={index} // Sử dụng index hoặc một ID duy nhất từ section
          title={section.title}
          products={section.products}
        />
      ))}
    </div>
  );
}

