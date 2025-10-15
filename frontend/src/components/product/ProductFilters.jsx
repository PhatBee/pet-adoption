import React, { useState, useEffect } from 'react';
import productApi from '../../api/productApi'; // Đường dẫn có thể cần điều chỉnh

// Component giờ sẽ nhận các bộ lọc ban đầu từ props
export default function ProductFilters({ initialFilters, onFilterChange }) {
  
  // State cục bộ cho các trường form, được khởi tạo từ props
  const [filters, setFilters] = useState(initialFilters);

  // State để lưu các tùy chọn động cho dropdown
  const [options, setOptions] = useState({
    pets: [],
    categories: [],
  });

  // Gọi API để lấy các tùy chọn (thú cưng, thể loại) khi component được tải
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await productApi.getFilterOptions();
        setOptions({
          pets: response.data.pets || [],
          categories: response.data.categories || [],
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu bộ lọc", error);
      }
    };
    fetchOptions();
  }, []);
  
  // Đồng bộ state cục bộ nếu URL thay đổi từ bên ngoài (ví dụ, nút back/forward của trình duyệt)
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // Truyền state bộ lọc hiện tại lên cho trang cha
    onFilterChange(filters);
  };
  
  const handleResetFilters = () => {
    const resetState = {
      searchTerm: '', category: '', pet: '',
      minPrice: '', maxPrice: '', sortBy: '',
    };
    setFilters(resetState);
    onFilterChange(resetState); // Cập nhật cả trang cha/URL
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
          <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleChange} placeholder="Tên sản phẩm..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        {/* Pet Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Loại thú cưng</label>
          <select name="pet" value={filters.pet} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="">Tất cả</option>
            {options.pets.map(pet => (
              <option key={pet._id} value={pet._id}>{pet.name}</option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Danh mục</label>
          <select name="category" value={filters.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="">Tất cả</option>
            {options.categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Sorting Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sắp xếp theo</label>
          <select name="sortBy" value={filters.sortBy} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option value="">Mới nhất</option>
            <option value="price-asc">Giá: Tăng dần</option>
            <option value="price-desc">Giá: Giảm dần</option>
            <option value="name-asc">Tên: A-Z</option>
            <option value="name-desc">Tên: Z-A</option>
          </select>
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Giá từ</label>
              <input type="number" name="minPrice" value={filters.minPrice} onChange={handleChange} placeholder="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Giá đến</label>
              <input type="number" name="maxPrice" value={filters.maxPrice} onChange={handleChange} placeholder="1,000,000" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 col-start-4">
          <button onClick={handleApplyFilters} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Lọc</button>
          <button onClick={handleResetFilters} className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Xóa lọc</button>
        </div>
      </div>
    </div>
  );
}