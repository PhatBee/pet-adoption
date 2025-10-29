// src/pages/admin/users/index.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchUsers, setUserQuery } from '../../store/slices/adminUserSlice';
import { NextPageWithLayout, User, UserQueryDto } from '../../types/next';
import AdminLayout from '../../components/AdminLayout';
import Head from 'next/head';
import { toast } from 'react-toastify';
import userApi from '../../store/api/userApi';
import { format } from 'date-fns';
import Pagination from '../../components/common/Pagination';
import UserDetailModal from '../../components/user/UserDetailModal';

interface UserTableProps {
    users: User[];
    onToggleActive: (user: User) => void;
    onViewDetail: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onToggleActive, onViewDetail }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên lạc</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm thưởng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày ĐK</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng Thái</th>
                    <th className="px-6 py-3"></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                    <tr key={user._id} className="hover:bg-indigo-50/20 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => onViewDetail(user._id)}>
                            {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <p>{user.email}</p>
                            <p className="text-xs text-indigo-500">{user.phone || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.loyaltyPoints || 0} {/* */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                                onClick={() => onToggleActive(user)} 
                                className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                            >
                                {user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const UserFilters: React.FC<{ query: UserQueryDto, onFilterChange: (newParams: Partial<UserQueryDto>) => void }> = ({ query, onFilterChange }) => (
    <div className="flex justify-start items-center mb-6 p-4 bg-white shadow rounded-lg border border-gray-100 space-x-4">
        <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
                id="status"
                value={query.isActive === undefined ? 'all' : (query.isActive ? 'active' : 'inactive')}
                onChange={(e) => {
                    const value = e.target.value;
                    onFilterChange({
                        page: 1,
                        isActive: value === 'all' ? undefined : (value === 'active' ? true : false)
                    });
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
            </select>
        </div>
        {/* TODO: Thêm các bộ lọc/sắp xếp khác (sortBy, sortOrder) */}
    </div>
);

const UserManagementPage: NextPageWithLayout = () => {
    const dispatch = useAppDispatch();
    const { users, loading, error, pagination, query } = useAppSelector(state => (state as any).adminUsers);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    
    useEffect(() => {
        dispatch(fetchUsers(query));
    }, [query, dispatch]);

    const handleQueryChange = (newParams: Partial<UserQueryDto>) => {
        dispatch(setUserQuery(newParams));
    };

    const handleToggleActive = async (user: User) => {
        const action = user.isActive ? 'vô hiệu hóa' : 'kích hoạt';
        if (confirm(`Bạn có chắc muốn ${action} tài khoản ${user.name}?`)) {
            try {
                if (user.isActive) {
                    await userApi.disableUser(user._id);
                } else {
                    await userApi.enableUser(user._id);
                }
                toast.success(`${action} thành công!`);
                dispatch(fetchUsers(query));
            } catch (err: any) {
                toast.error(`Lỗi: ${err.message || 'Không thể thay đổi trạng thái'}`);
            }
        }
    };
    
    const handleViewDetail = (id: string) => {
        setSelectedUserId(id); 
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedUserId(null);
    };

    return (
        <>
            <Head>
                <title>Quản lý Người dùng | Admin</title>
            </Head>
            <div className="p-8 bg-gray-50 min-h-screen"> 
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Quản Lý Người Dùng</h1>

                <UserFilters query={query} onFilterChange={handleQueryChange} />

                {loading && <p className="text-indigo-600">Đang tải...</p>}
                {error && <p className="text-red-500 p-4 bg-red-50 rounded-md">Lỗi: {error}</p>}

                {!loading && !error && (
                    <>
                        <UserTable 
                            users={users || []}
                            onToggleActive={handleToggleActive}
                            onViewDetail={handleViewDetail}
                        />
                        <Pagination 
                            pagination={pagination} 
                            onPageChange={(page) => handleQueryChange({ page })} 
                        />
                       
                    </>
                )}
            </div>
            
            {selectedUserId && (
                 <UserDetailModal
                    userId={selectedUserId}
                    isOpen={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                 />
            )}
        </>
    );
};

UserManagementPage.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <AdminLayout>{page}</AdminLayout> // Giả định layout
    );
};

export default UserManagementPage;