import React from 'react';
import { Link } from 'react-router-dom';

export default function AddressListPage() {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Sổ địa chỉ của bạn</h2>
        <Link 
          to="/profile/addresses/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition no-underline"
        >
          Thêm địa chỉ mới
        </Link>
      </div>
      
      {/* TODO: Hiển thị danh sách địa chỉ ở đây */}
      <div className="text-center text-gray-500 py-8">
        <p>Bạn chưa có địa chỉ nào được lưu.</p>
      </div>
    </div>
  );
}