// src/components/user/UserDetailView.tsx
import React from 'react';
import { User, Address } from '../../types/next';
import { format } from 'date-fns';

interface UserDetailViewProps {
    user: User;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || '—'}</dd>
    </div>
);

const AddressCard: React.FC<{ address: Address, isDefault?: boolean }> = ({ address, isDefault }) => (
    <div className={`p-3 border rounded ${isDefault ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}>
        <p className="font-semibold text-sm">
            {address.fullName} {isDefault && <span className="text-xs text-indigo-600">(Mặc định)</span>}
        </p>
        <p className="text-xs text-gray-600">{address.phone}</p>
        <p className="text-xs text-gray-600">{address.street}</p>
        <p className="text-xs text-gray-600">
            {address.ward ? `${address.ward}, ` : ''}
            {address.district ? `${address.district}, ` : ''}
            {address.city}
        </p>
    </div>
);


const UserDetailView: React.FC<UserDetailViewProps> = ({ user }) => {
    return (
        <div className="space-y-5">
            <dl className="divide-y divide-gray-200">
                <DetailRow label="ID" value={user._id} />
                <DetailRow label="Họ tên" value={user.name} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Số điện thoại" value={user.phone} />
                <DetailRow label="Tổng chi tiêu" value={`${(user.totalSpend ?? 0).toLocaleString()} VNĐ`} />
                <DetailRow label="Tổng đơn hàng" value={user.totalOrders ?? 0} />
                <DetailRow label="Điểm thưởng" value={user.loyaltyPoints} />
                <DetailRow
                    label="Trạng thái TK"
                    value={
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                        </span>
                    }
                />
                 <DetailRow
                    label="Xác thực Email"
                    value={
                        <span className={`text-xs ${user.isVerified ? 'text-green-600' : 'text-orange-600'}`}>
                            {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                        </span>
                    }
                />
                <DetailRow label="Ngày đăng ký" value={format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')} />
            </dl>

            {user.addresses && user.addresses.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Địa chỉ đã lưu:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {user.addresses.map((addr, index) => (
                           <AddressCard key={addr._id || index} address={addr} isDefault={addr.isDefault} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetailView;