// src/pages/admin/products/index.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProducts, setProductQuery } from '../../store/slices/adminProductSlice';
import AdminLayout from '../../components/AdminLayout';
import { NextPageWithLayout, Product, ProductQueryDto, PaginatedResult } from '../../types/next';
import Head from 'next/head';
import ProductModal from '../../components/product/ProductModal';
import productApi from '../../store/api/productApi';
import { toast } from 'react-toastify';

type ModalMode = 'create' | 'view' | 'edit' | null;

interface ModalState {
    isOpen: boolean;
    mode: ModalMode;
    productId: string | null;
}

interface ProductTableProps {
    products: Product[];
    onDetailView: (id: string) => void;
    onEdit: (id: string) => void;
    onDisable: (id: string) => void;
    onEnable: (id: string) => void;
}

interface SearchAndFilterProps {
    query: ProductQueryDto;
    onSearchChange: (newParams: Partial<ProductQueryDto>) => void;
    onAddProduct: () => void;
}

interface PaginationProps {
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    onPageChange: (page: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onDetailView, onEdit, onDisable, onEnable }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản Phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                    <th className="px-6 py-3"></th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {products?.map((product: Product) => (
                    <tr key={product._id} className="hover:bg-indigo-50/20 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <img src={`${product.thumbnail}`} alt={product.name} className="h-10 w-10 object-cover rounded-full" />
                        </td>
                        <td
                            className="px-6 py-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer max-w-xs overflow-hidden text-ellipsis"
                            onClick={() => onDetailView(product._id)}
                        >
                            <div className="truncate">
                                {product.name.split(" ").slice(0, 20).join(" ") + (product.name.split(" ").length > 20 ? "..." : "")}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price.toLocaleString()} VNĐ</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {product.isActive ? 'Kinh doanh' : 'Vô hiệu hóa'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => onEdit(product._id)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                                Sửa
                            </button>
                            {product.isActive ? (
                                <button
                                    onClick={() => onDisable(product._id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Vô hiệu
                                </button>
                            ) : (
                                <button
                                    onClick={() => onEnable(product._id)}
                                    className="text-green-600 hover:text-green-900"
                                >
                                    Kích hoạt
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ query, onSearchChange, onAddProduct }) => (
    <div className="flex justify-between items-center mb-6 p-4 bg-white shadow rounded-lg border border-gray-100">
        <div className="flex space-x-4">
            <input
                type="text"
                placeholder="Tìm kiếm theo tên/slug..."
                value={query.search || ''}
                onChange={(e) => onSearchChange({ search: e.target.value, page: 1 })}
                className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* TODO: Thêm select box cho CategoryId và PetId */}
        </div>
        <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-150 shadow-md"
        >
            + Thêm Sản Phẩm
        </button>
    </div>
);

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => (
    <div className="flex justify-between items-center mt-4 p-4 bg-white shadow rounded-lg border border-gray-100">
        <p className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
            đến <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}</span>
            trong tổng số <span className="font-medium">{pagination.totalItems}</span> kết quả
        </p>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
                onClick={() => onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
                Trước
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-indigo-600 text-sm font-medium text-white">
                {pagination.currentPage}
            </span>
            <button
                onClick={() => onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
                Sau
            </button>
        </nav>
    </div>
);
// --- TRANG CHÍNH ---
const ProductManagementPage: NextPageWithLayout = () => {
    const dispatch = useAppDispatch();
    const { products, loading, error, pagination, query } = useAppSelector(state => (state as any).adminProducts);

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        mode: null,
        productId: null,
    });

    useEffect(() => {
        dispatch(fetchProducts(query));
    }, [query, dispatch]);

    // 2. Xử lý Modal và Re-fetch
    const handleCloseModal = () => {
        setModalState({ isOpen: false, mode: null, productId: null });
        dispatch(fetchProducts(query));
    };

    const handleSwitchToEdit = () => {
        if (modalState.mode === 'view') {
            setModalState(prev => ({ ...prev, mode: 'edit' }));
        }
    }

    const handleQueryChange = (newParams: Partial<ProductQueryDto>) => {
        dispatch(setProductQuery(newParams));
    };

    const handlePageChange = (newPage: number) => {
        handleQueryChange({ page: newPage });
    };

    const handleAddProduct = () => {
        console.log('Opening create modal');
        setModalState({ isOpen: true, mode: 'create', productId: null });
    }

    const handleViewDetail = (id: string) => {
        setModalState({ isOpen: true, mode: 'view', productId: id });
    }

    const handleEditFromTable = (id: string) => {
        setModalState({ isOpen: true, mode: 'edit', productId: id });
    }

    const handleDisable = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn vô hiệu hóa sản phẩm này không?')) {
            try {
                await productApi.disableProduct(id);
                toast.success('Vô hiệu hóa thành công!');
                dispatch(fetchProducts(query));
            } catch (err: any) {
                toast.error('Vô hiệu hóa thất bại: ' + (err.response?.data?.message || 'Lỗi server'));
            }
        }
    };

    const handleEnable = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn kích hoạt lại sản phẩm này không?')) {
            try {
                await productApi.enableProduct(id);
                toast.success('Kích hoạt lại sản phẩm thành công!');
                dispatch(fetchProducts(query));
            } catch (err: any) {
                toast.error('Kích hoạt lại thất bại: ' + (err.response?.data?.message || 'Lỗi server'));
            }
        }
    };

    return (
        <>
            <Head>
                <title>Quản lý Sản phẩm | Admin</title>
            </Head>
            <div className="p-8 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Quản Lý Sản Phẩm</h1>

                <SearchAndFilter
                    query={query}
                    onSearchChange={handleQueryChange}
                    onAddProduct={handleAddProduct}
                />

                {loading && <p className="text-indigo-600">Đang tải...</p>}
                {error && <p className="text-red-500 p-4 bg-red-50 rounded-md">Lỗi: {error}</p>}

                {!loading && !error && (
                    <>
                        <ProductTable
                            products={products}
                            onDetailView={handleViewDetail}
                            onEdit={handleEditFromTable}
                            onDisable={handleDisable}
                            onEnable={handleEnable}
                        />
                        <Pagination
                            pagination={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            <ProductModal
                isOpen={modalState.isOpen}
                mode={modalState.mode}
                productId={modalState.productId}
                onClose={handleCloseModal}
                onSwitchToEdit={handleSwitchToEdit}
            />
        </>
    );
};

ProductManagementPage.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <AdminLayout>{page}</AdminLayout>
    );
};

export default ProductManagementPage;