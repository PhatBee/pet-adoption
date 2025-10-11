import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductList } from '../store/productListSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';
import ErrorPage from './ErrorPage';

export default function ProductListPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Lấy số trang từ URL (ví dụ: /products?page=2), mặc định là trang 1
  const page = parseInt(searchParams.get('page')) || 1;

  // 2. Lấy dữ liệu từ Redux store
  const { products, pages, isLoading, error } = useSelector(state => state.productList);

  // 3. Gọi API mỗi khi 'page' thay đổi
  useEffect(() => {
    dispatch(fetchProductList({ page, limit: 12 }));
    console.log("Fetching products for page:", page);
  }, [dispatch, page]);

  // 4. Hàm xử lý khi người dùng click vào một trang mới
  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage });
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
  };

  if (isLoading) {
    return <p className="text-center p-10">Đang tải sản phẩm...</p>;
  }

  if (error) {
    return <ErrorPage statusCode="500" title="Lỗi tải sản phẩm" message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tất cả sản phẩm</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}