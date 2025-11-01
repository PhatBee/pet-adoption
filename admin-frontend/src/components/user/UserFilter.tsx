"use client";

import React, { useState, useEffect, useRef } from 'react';
import { UserQueryDto } from '../../types/next';

interface UserFiltersProps { 
    query: UserQueryDto; 
    onFilterChange: (newParams: Partial<UserQueryDto>) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ query, onFilterChange }) => {
    
    const [searchValue, setSearchValue] = useState(query.search || '');
    const isMounted = useRef(false);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        
        const handler = setTimeout(() => {
            if (searchValue !== query.search) {
                onFilterChange({ page: 1, search: searchValue });
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchValue, query.search, onFilterChange]);

    useEffect(() => {
        if (query.search !== searchValue) {
            setSearchValue(query.search || '');
        }
    }, [query.search]);

    return (
        <div className="flex justify-start items-center mb-6 p-4 bg-white shadow rounded-lg border border-gray-100 space-x-4">
            <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
                <input
                    id="search"
                    type="text"
                    placeholder="Tên, Email, SĐT..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
            </div>

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
};

export default UserFilters;