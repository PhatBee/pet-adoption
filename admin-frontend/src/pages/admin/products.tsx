// src/pages/admin/products/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProducts, setProductQuery } from '../../store/slices/adminProductSlice';
import AdminLayout from '../../components/AdminLayout';
import { NextPageWithLayout, Product, ProductQueryDto, ComboboxOption, BaseRef } from '../../types/next';
import Head from 'next/head';
import ProductModal from '../../components/product/ProductModal';
import productApi from '../../store/api/productApi';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import useSWR from 'swr';
import categoryApi from '../../store/api/categoryApi';
import petApi from '../../store/api/petApi';
import { QueryDto, PaginatedData } from '../../types/petCate.dto';
import ProductFilter from '../../components/product/ProductFilter';

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

const ProductTable: React.FC<ProductTableProps> = ({ products, onDetailView, onEdit, onDisable, onEnable }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Sản Phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tồn kho</th> */}
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
                                {product.name.split(" ").slice(0, 50).join(" ") + (product.name.split(" ").length > 50 ? "..." : "")}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price.toLocaleString()} VNĐ</td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td> */}
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

const fetcher = async (url: string): Promise<ComboboxOption[]> => {
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

// --- TRANG CHÍNH ---
const ProductManagementPage: NextPageWithLayout = () => {
    const dispatch = useAppDispatch();
    const { products, loading, error, pagination, query } = useAppSelector(state => (state as any).adminProducts);

    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        mode: null,
        productId: null,
    });

    const { data: categoryOptions } = useSWR<ComboboxOption[]>('/admin/categories', fetcher);
    const { data: petOptions } = useSWR<ComboboxOption[]>('/admin/pets', fetcher);

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

    const handleQueryChange = useCallback((newParams: Partial<ProductQueryDto>) => {
        dispatch(setProductQuery({ ...query, ...newParams, page: 1 }));
    }, [dispatch]);

    const handlePageChange = (newPage: number) => {
        dispatch(setProductQuery({ page: newPage }));
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
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                    <h1 className="text-3xl font-bold text-gray-800">Quản Lý Sản Phẩm</h1>
                    <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-150 shadow-md"
                    >
                        + Thêm Sản Phẩm
                    </button>
                </div>

                <ProductFilter
                    initialQuery={query}
                    onQueryChange={handleQueryChange}
                    categoryOptions={categoryOptions || []}
                    petOptions={petOptions || []}
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