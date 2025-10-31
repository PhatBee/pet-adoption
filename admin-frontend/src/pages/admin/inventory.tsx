// InventoryManagementPage.tsx

"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { Product, BaseRef } from '../../types/next'; 
import AdminLayout from '../../components/AdminLayout';
import Pagination, { PaginationProps } from '../../components/common/Pagination'; 
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import FormInput from '../../components/common/FormInput';
import InventoryFilter from '../../components/inventory/InventoryFilter';
import { InventoryQueryDto, InventorySortBy, UpdateStockDto } from '../../types/inventory.dto';
import { ComboboxOption } from '../../types/next';
import useSWR from 'swr';
import { fetchInventory, updateProductStock } from '../../store/slices/adminInventorySlice';
import categoryApi from '../../store/api/categoryApi';
import petApi from '../../store/api/petApi';
import { QueryDto, PaginatedData } from '../../types/petCate.dto';

interface StockForm { quantity: number; }

const fetcher = async (url: string): Promise<ComboboxOption[]> => {
    let data: BaseRef[];
    const queryAll: QueryDto = { page: 1, limit: 1000 };
    let result: PaginatedData;

    if (url === '/admin/categories') {
        result = await categoryApi.findAll(queryAll);
    } else if (url === '/admin/pets') {
        result = await petApi.findAll(queryAll);
    } else {
        return Promise.reject(new Error('Unknown fetcher URL'));
    }

    return result.data.map(item => ({
        value: item._id,
        label: item.name,
    }));
};

const SORTABLE_COLUMNS: { label: string; field: InventorySortBy }[] = [
    { label: 'Tên sản phẩm', field: InventorySortBy.NAME },
    { label: 'Ngày tạo', field: InventorySortBy.NEWEST },
    { label: 'Tồn kho', field: InventorySortBy.MOST_STOCK },
];

interface StockInFormProps {
    product: Product;
    onStockIn: (productId: string, quantity: number) => void;
    isLoading: boolean;
}

const StockInForm: React.FC<StockInFormProps> = ({ product, onStockIn, isLoading }) => {
    const methods = useForm<StockForm>({
        defaultValues: { quantity: 1 }
    });
    const { handleSubmit, register, formState: { isSubmitting } } = methods;

    const handleLocalSubmit = (data: StockForm) => {
        onStockIn(product._id, Number(data.quantity));
        methods.reset({ quantity: 1 });
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleLocalSubmit)} className="flex items-center space-x-2">
                <FormInput 
                    label=""
                    name={`quantity`} 
                    type="number" 
                    min={1} 
                    step={1} 
                    className="w-20"
                    inputClassName="h-8"
                />
                <button 
                    type="submit"
                    disabled={isLoading || isSubmitting}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded-md shadow hover:bg-green-600 disabled:opacity-50 transition"
                >
                    Nhập kho
                </button>
            </form>
        </FormProvider>
    );
};

const InventoryManagementPage = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const dispatch = useAppDispatch();
    const { products, pagination, loading, error } = useAppSelector(
        (state) => state.adminInventory
    );
    
    const [filterQuery, setFilterQuery] = useState<Partial<InventoryQueryDto>>({
        search: '',
        categoryId: '',
        petId: '',
        sortBy: InventorySortBy.NEWEST,
        sortOrder: 'desc',
    });
    
    const { data: categoryOptions } = useSWR<ComboboxOption[]>('/admin/categories', fetcher);
    const { data: petOptions } = useSWR<ComboboxOption[]>('/admin/pets', fetcher);

    const fetchData = useCallback(() => {
        const queryToSend: InventoryQueryDto = {
            page, 
            limit, 
            search: filterQuery.search || undefined,
            categoryId: filterQuery.categoryId || undefined,
            petId: filterQuery.petId || undefined,
            sortBy: filterQuery.sortBy || undefined,
            sortOrder: filterQuery.sortOrder || undefined,
        } as InventoryQueryDto;
        
        dispatch(fetchInventory(queryToSend));

    }, [dispatch, page, limit, filterQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (loading === 'failed' && error) {
            toast.error(error);
        }
    }, [loading, error]);

    const handleSort = (field: InventorySortBy) => {
        let newSortOrder: 'asc' | 'desc';
        const newSortBy: InventorySortBy = field;

        if (filterQuery.sortBy === field) {
            newSortOrder = filterQuery.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            newSortOrder = (field === InventorySortBy.NEWEST || field === InventorySortBy.MOST_STOCK) ? 'desc' : 'asc';
        }

        setFilterQuery({ ...filterQuery, sortBy: newSortBy, sortOrder: newSortOrder });
        setPage(1);
    };
    
    const handleFilterChange = useCallback((newFilter: Partial<InventoryQueryDto>) => {
        setFilterQuery(prev => ({
            ...prev, 
            search: newFilter.search,
            categoryId: newFilter.categoryId,
            petId: newFilter.petId,
            sortBy: newFilter.sortBy !== undefined ? newFilter.sortBy : prev.sortBy,
            sortOrder: newFilter.sortOrder !== undefined ? newFilter.sortOrder : prev.sortOrder,
        }));
        setPage(1);
    }, []);
    
    const handleStockIn = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            return toast.error("Số lượng nhập phải lớn hơn 0.");
        }
        const dto: UpdateStockDto = { quantity };
        dispatch(updateProductStock({ id: productId, dto }));
    };
    
    const renderSortIcon = (field: InventorySortBy) => {
        if (filterQuery.sortBy !== field) return null;
        return filterQuery.sortOrder === 'asc' ? ' ↑' : ' ↓';
    };

    const paginationData: PaginationProps['pagination'] = pagination ? {
        totalItems: pagination.totalItems,
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
        limit: limit,
    } : {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit: limit,
    };
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý Kho Hàng</h1>
            
            <InventoryFilter
                onFilterChange={handleFilterChange}
                categoryOptions={categoryOptions || []}
                petOptions={petOptions || []}
                initialQuery={filterQuery}
            />

            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Hình ảnh</th>
                            
                            {SORTABLE_COLUMNS.map(({ label, field }) => (
                                <th 
                                    key={field}
                                    onClick={() => handleSort(field)} 
                                    className="p-4 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition"
                                >
                                    {label === 'Ngày tạo' ? 'Ngày nhập' : label}
                                    {renderSortIcon(field)}
                                </th>
                            ))}
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Số lượng nhập</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading === 'pending' && products.length === 0 && (
                            <tr><td colSpan={7} className="p-4 text-center">Đang tải...</td></tr>
                        )}
                        {loading !== 'pending' && products.length === 0 && (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào.</td></tr>
                        )}
                        {products.map((product) => (
                            <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="p-4">
                                    {product.thumbnail && (
                                        <Image
                                            src={`${BACKEND_URL}${product.thumbnail}`}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded object-cover"
                                        />
                                    )}
                                </td>
                                
                                <td className="p-4 text-sm font-medium text-gray-900 max-w-xs">{product.name}</td>
                                
                                <td className="p-4 text-sm text-gray-700">
                                    {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                
                                <td className="p-4 text-sm text-center">
                                    <span className={`font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                
                                <td className="p-4">
                                    <StockInForm 
                                        product={product} 
                                        onStockIn={handleStockIn} 
                                        isLoading={loading === 'pending'} 
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    pagination={paginationData}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            )}
        </div>
    );
};

InventoryManagementPage.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <AdminLayout>{page}</AdminLayout>
    );
};

export default InventoryManagementPage;