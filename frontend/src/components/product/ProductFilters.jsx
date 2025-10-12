import React, { useState } from 'react';

export default function ProductFilters({ onFilterChange }) {
  // State to hold all the filter values
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    pet: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    // Pass the current filter state up to the parent page
    onFilterChange(filters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
            placeholder="Tên sản phẩm..."
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Sorting Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sắp xếp theo</label>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Mới nhất</option>
            <option value="price-asc">Giá: Tăng dần</option>
            <option value="price-desc">Giá: Giảm dần</option>
            <option value="name-asc">Tên: A-Z</option>
            <option value="name-desc">Tên: Z-A</option>
          </select>
        </div>

        {/* More filters for category, pet, price will go here */}

        {/* Apply Button */}
        <div className="flex items-end">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}