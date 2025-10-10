import React from 'react';
import { Link } from 'react-router-dom';

export default function AddressManagementLink() {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-3 text-gray-800">Sổ địa chỉ</h2>
      <p className="text-gray-600 mb-4">
        Quản lý hoặc thêm mới địa chỉ nhận hàng của bạn.
      </p>
      <Link
        to="/profile/addresses"
        className="inline-block w-full text-center py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg shadow-sm transition"
      >
        Quản lý địa chỉ
      </Link>
    </div>
  );
}