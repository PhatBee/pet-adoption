import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductList } from '../store/productListSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';
import ErrorPage from './ErrorPage';
import ProductFilters from '../components/product/ProductFilters'; // 1. Import component mới

export default function ProductListPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // 2. Lấy tất cả các tham số lọc từ URL
  const filters = {
    page: parseInt(searchParams.get('page')) || 1,
    searchTerm: searchParams.get('searchTerm') || '',
    category: searchParams.get('category') || '',
    pet: searchParams.get('pet') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || '',
  };

  // 2. Lấy dữ liệu từ Redux store
  const { products, pages, isLoading, error } = useSelector(state => state.productList);

  // 3. Gọi API mỗi khi có bất kỳ tham số nào trong URL thay đổi
  useEffect(() => {
    // Chỉ gửi đi các bộ lọc có giá trị
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    dispatch(fetchProductList(activeFilters));
  }, [dispatch, searchParams]); // Phụ thuộc vào searchParams

  // 4. Hàm xử lý khi người dùng áp dụng bộ lọc mới
  const handleFilterChange = (newFilters) => {
    // Tạo một đối tượng URLSearchParams mới
    const params = new URLSearchParams();
    
    // Thêm các bộ lọc mới vào params, bỏ qua các giá trị rỗng
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // Đặt lại trang về 1 khi áp dụng bộ lọc mới
    params.set('page', '1');

    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  const handlePageChange = (newPage) => {
    // Giữ lại các bộ lọc hiện tại và chỉ cập nhật trang
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo(0, 0);
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
      
      {/* Cập nhật ở đây: truyền initialFilters vào */}
      <ProductFilters 
        initialFilters={filters} 
        onFilterChange={handleFilterChange} 
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>

      <Pagination
        page={filters.page}
        pages={pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}