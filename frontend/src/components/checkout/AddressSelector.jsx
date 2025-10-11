import React, { useEffect } from 'react';
import { FaPlusCircle } from 'react-icons/fa'; // Dùng icon cho đẹp hơn

export default function AddressSelector({ addresses = [], value, onChange, onAddNew }) {
  // Tự động chọn địa chỉ mặc định khi component được tải
  useEffect(() => {
    if (!value && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      onChange(defaultAddress);
    }
  }, [addresses, value, onChange]);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h4 className="font-semibold text-lg mb-4">Địa chỉ giao hàng</h4>
      
      {/* Danh sách địa chỉ đã lưu */}
      <div className="space-y-3">
        {addresses.map((addr) => (
          <label 
            key={addr._id} 
            className={`block border rounded-lg p-3 cursor-pointer transition-all ${value?._id === addr._id ? "border-blue-500 bg-blue-50 border-2" : "border-gray-200"}`}
          >
            <div className="flex items-start">
              <input
                type="radio"
                name="address"
                className="mr-3 mt-1 h-4 w-4"
                onChange={() => onChange(addr)}
                checked={value?._id === addr._id}
              />
              <div>
                <span className="font-semibold">{addr.fullName}</span> — {addr.phone}
                {addr.isDefault && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Mặc định</span>}
                <div className="text-sm text-gray-600 mt-1">{`${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}`}</div>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Nút thêm địa chỉ mới */}
      <div className="mt-4">
        <button 
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition" 
          type="button" 
          onClick={onAddNew}
        >
          <FaPlusCircle />
          <span>Thêm địa chỉ giao hàng mới</span>
        </button>
      </div>
    </div>
  );
}