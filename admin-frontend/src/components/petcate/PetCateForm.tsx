"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormInput from '../common/FormInput';
import Pagination, { PaginationProps } from '../common/Pagination';
import ModalPetCate from './ModalPetCatet';
import { QueryDto, CreateDto, ResponseDto } from '../../types/petCate.dto';
import { PaginatedResult } from '../../types/next';
import { toast } from 'react-hot-toast';

interface PetCateFormProps {
    title: string;
    items: ResponseDto[];
    pagination: PaginatedResult<ResponseDto> | null;
    loading: 'idle' | 'pending' | 'succeeded' | 'failed';
    query: QueryDto;
    fetchItems: (query: QueryDto) => void;
    createItem: (dto: CreateDto) => void;
    updateItem: (params: { id: string, dto: CreateDto }) => void;
    deleteItem: (id: string) => void;
    setQuery: (query: Partial<QueryDto>) => void;
}

const PetCateForm: React.FC<PetCateFormProps> = ({
    title, items, pagination, loading, query,
    fetchItems, createItem, updateItem, deleteItem, setQuery
}) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ResponseDto | null>(null);

    const isMounted = useRef(false);

    const searchMethods = useForm({
        defaultValues: { search: query.search || '' },
    });
    const searchQuery = searchMethods.watch('search');

    useEffect(() => {
        fetchItems(query);
    }, [query, fetchItems]);

    useEffect(() => {

        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const handler = setTimeout(() => {
            setQuery({ ...query, search: searchQuery, page: 1 });
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, setQuery, query]);

    const handlePageChange = (newPage: number) => {
        setQuery({ ...query, page: newPage });
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: ResponseDto) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSubmitModal = (data: CreateDto) => {
        if (editingItem) {
            updateItem({ id: editingItem._id, dto: data });
        } else {
            createItem(data);
        }
    };

    useEffect(() => {
        if (loading === 'succeeded') {
            closeModal();
        }
    }, [loading]);

    const handleDelete = (item: ResponseDto) => {
        if (item.productCount > 0) {
            toast.error(`Không thể xóa "${item.name}" vì đang có ${item.productCount} sản phẩm sử dụng.`);
            return;
        }
        if (confirm(`Bạn có chắc muốn xóa "${item.name}"?`)) {
            deleteItem(item._id);
        }
    };

    const paginationData: PaginationProps['pagination'] | null = pagination ? {
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
        limit: query.limit || 10,
    } : null;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{title}</h1>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
                >
                    + Thêm mới
                </button>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="mb-4 max-w-sm">
                <FormProvider {...searchMethods}>
                    <FormInput
                        label=""
                        name="search"
                        placeholder="Tìm kiếm theo tên..."
                    />
                </FormProvider>
            </div>

            {/* Bảng dữ liệu */}
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Tên</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Số sản phẩm</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading === 'pending' && (
                            <tr><td colSpan={3} className="p-4 text-center">Đang tải...</td></tr>
                        )}
                        {loading !== 'pending' && items.length === 0 && (
                            <tr><td colSpan={3} className="p-4 text-center text-gray-500">Không tìm thấy dữ liệu.</td></tr>
                        )}
                        {loading !== 'pending' && items.map((item) => (
                            <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-4 text-sm font-medium text-gray-900">{item.name}</td>
                                <td className="p-4 text-sm text-gray-700">{item.productCount}</td>
                                <td className="p-4 text-sm space-x-2">
                                    <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900">Sửa</button>
                                    <button
                                        onClick={() => handleDelete(item)}
                                        className={`hover:text-red-900 ${item.productCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600'}`}
                                        disabled={item.productCount > 0}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {paginationData && paginationData.totalPages > 1 && (
                <Pagination
                    pagination={paginationData}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Modal Thêm/Sửa */}
            <ModalPetCate
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
                isLoading={loading === 'pending'}
                title={editingItem ? `Sửa: ${editingItem.name}` : `Tạo ${title.replace('Quản lý ', '').toLowerCase()}`}
                defaultName={editingItem?.name}
            />
        </div>
    );
};

export default PetCateForm;