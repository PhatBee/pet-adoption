import React from 'react';

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const fullAddress = `${address.street}, ${address.ward || ''}, ${address.district || ''}, ${address.city}`;

  return (
    <div className={`p-4 border rounded-lg relative ${address.isDefault ? 'border-blue-500 border-2' : 'border-gray-300'}`}>
      {address.isDefault && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
          Mặc định
        </div>
      )}
      
      <div className="font-bold text-gray-800">{address.fullName}</div>
      <div className="text-gray-600 text-sm mt-1">
        <p>Địa chỉ: {fullAddress.replace(/, ,/g, ',').replace(/, $/, '')}</p>
        <p>Điện thoại: {address.phone}</p>
      </div>

      <div className="flex gap-2 mt-4 border-t pt-3">
        <button onClick={() => onEdit(address)} className="text-blue-600 hover:underline text-sm font-medium">
          Sửa
        </button>
        <button onClick={() => onDelete(address._id)} className="text-red-600 hover:underline text-sm font-medium">
          Xóa
        </button>
        {!address.isDefault && (
          <button onClick={() => onSetDefault(address._id)} className="text-gray-700 hover:underline text-sm font-medium ml-auto">
            Đặt làm mặc định
          </button>
        )}
      </div>
    </div>
  );
}