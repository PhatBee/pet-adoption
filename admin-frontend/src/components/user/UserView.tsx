import React from 'react';
import { User, Address } from '../../types/next';
import { format } from 'date-fns';

interface UserViewProps {
  user: User;
}

const AddressCard: React.FC<{ address: Address, isDefault?: boolean }> = ({ address, isDefault }) => (
    <div className={`p-3 border rounded ${isDefault ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-200'}`}>
        <p className="font-medium">{address.fullName} {isDefault && <span className="text-xs text-indigo-600">(Mặc định)</span>}</p>
        <p className="text-sm text-gray-600">{address.phone}</p>
        <p className="text-sm text-gray-600">{`${address.street}, ${address.ward || ''}, ${address.district || ''}, ${address.city}`}</p>
    </div>
);


const UserView: React.FC<UserViewProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="flex items-start gap-4 pb-4 border-b">
        <img
          src={user.avatarUrl || '/default-avatar.png'} // Add a default avatar
          alt={user.name}
          className="w-16 h-16 object-cover rounded-full border shadow-sm"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-500">{user.phone || 'Chưa có SĐT'}</p>
        </div>
      </div>

      {/* Account & Activity Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg border">
          <div><strong className="block text-gray-500">Trạng thái TK</strong> {user.isActive ? <span className="text-green-600">Hoạt động</span> : <span className="text-red-600">Vô hiệu hóa</span>}</div>
          <div><strong className="block text-gray-500">Đã xác thực</strong> {user.isVerified ? '✓ Có' : '✗ Chưa'}</div>
          <div><strong className="block text-gray-500">Điểm thưởng</strong> {user.loyaltyPoints || 0}</div>
          <div><strong className="block text-gray-500">Ngày đăng ký</strong> {format(new Date(user.createdAt), 'dd/MM/yyyy')}</div>
      </div>

      {/* Aggregated Stats (If available) */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
           <div><strong className="block text-gray-500">Tổng chi tiêu</strong> <span className="font-semibold text-indigo-700">{user.totalSpend?.toLocaleString() || 0} VNĐ</span></div>
           <div><strong className="block text-gray-500">Tổng số đơn hàng</strong> <span className="font-semibold text-indigo-700">{user.totalOrders || 0}</span></div>
       </div>

      {/* Addresses */}
      {user.addresses && user.addresses.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-2">Sổ địa chỉ ({user.addresses.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {user.addresses.map((addr, index) => (
              <AddressCard key={addr._id || index} address={addr} isDefault={addr.isDefault} />
            ))}
          </div>
        </div>
      )}
      {!user.addresses || user.addresses.length === 0 && (
          <p className="text-sm text-gray-500">Chưa có địa chỉ nào được lưu.</p>
      )}

    </div>
  );
};

export default UserView;