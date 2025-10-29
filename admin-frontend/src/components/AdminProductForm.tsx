import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, Resolver } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreateProductDto, UpdateProductDto, Product, BaseRef } from '../types/next';
import FormInput from './product/FormInput';
import ImageUploadSection from './product/ImageUploadSection';
import productApi from '../store/api/productApi';
import { toast } from 'react-toastify';
import FormSelect from './product/FormSelect';
import categoryApi from '../store/api/categoryApi';
import petApi from '../store/api/petApi';

const productSchema = yup.object().shape({
    name: yup.string().required('Tên sản phẩm là bắt buộc.'),
    price: yup.number().required('Giá là bắt buộc.').min(0, 'Giá phải lớn hơn hoặc bằng 0.'),
    stock: yup.number().required('Số lượng tồn kho là bắt buộc.').min(0, 'Tồn kho phải lớn hơn hoặc bằng 0.'),
    category: yup.string().required('Thể loại là bắt buộc.').test('is-mongo-id', 'Thể loại không hợp lệ.', val => !!val),
    pet: yup.string().required('Loại thú cưng là bắt buộc.').test('is-mongo-id', 'Loại thú cưng không hợp lệ.', val => !!val),
    thumbnail: yup.string().required('Ảnh thumbnail là bắt buộc.'),
    shortDescription: yup.string().nullable().optional(),
    description: yup.string().nullable().optional(),
    compareAtPrice: yup.number().min(0).optional(),
    images: yup.array(yup.string()).optional(),
    brand: yup.string().nullable().optional(),
    isActive: yup.boolean().optional(),
});

type FormData = CreateProductDto & { isActive?: boolean };

interface ProductFormProps {
    isEditMode: boolean;
    productId?: string | null;
    initialProduct?: Product;
    onSuccess?: () => void;
}

const mapProductToFormData = (product: Product): FormData => {
    const formData: FormData = {
        ...product,
        category: (product.category as BaseRef)?._id || (product.category as string),
        pet: (product.pet as BaseRef)?._id || (product.pet as string),
        shortDescription: product.shortDescription || null,
        description: product.description || null,
        thumbnail: product.thumbnail || null,
        brand: product.brand || null,
        
    } as FormData;
    
    return formData;
};

const ProductForm: React.FC<ProductFormProps> = ({ isEditMode, productId, initialProduct, onSuccess }) => {
    const [initialData, setInitialData] = useState<Product | null>(null);
    const [categories, setCategories] = useState<BaseRef[]>([]);
    const [pets, setPets] = useState<BaseRef[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const methods = useForm<FormData>({
        resolver: yupResolver(productSchema) as Resolver<FormData>,
        defaultValues: {
            name: '',
            price: 0,
            stock: 0,
            category: '',
            pet: '',
            thumbnail: '',
            compareAtPrice: 0,
            images: [],
            isActive: true,
            shortDescription: null,
            description: null,
            brand: null,
        } as FormData,
    });
    const { handleSubmit, reset } = methods;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [catRes, petRes] = await Promise.all([
                    categoryApi.findAll(),
                    petApi.findAll(),
                ]);
                setCategories(catRes);
                setPets(petRes);

                if (isEditMode && productId && !initialProduct) {
                    const product = await productApi.getProductById(productId);
                    setInitialData(product);
                    reset(mapProductToFormData(product));
                } else if (initialProduct) {
                    reset(mapProductToFormData(initialProduct));
                }
            } catch (error) {
                toast.error('Lỗi khi tải dữ liệu ban đầu.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isEditMode, productId, reset, initialProduct]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            if (isEditMode && productId) {
                await productApi.updateProduct(productId, data as UpdateProductDto);
                toast.success('Cập nhật thành công!');
            } else {
                await productApi.createProduct(data as CreateProductDto);
                toast.success('Tạo sản phẩm thành công!');
            }
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Lỗi xử lý yêu cầu.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !initialData) {
        return <p className="text-center text-indigo-600 p-8">Đang tải dữ liệu sản phẩm...</p>;
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow-xl rounded-xl border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
                    {isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h2>

                {/* 1. THÔNG TIN CƠ BẢN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Tên Sản Phẩm" name="name" placeholder="Ví dụ: Royal Canin Poodle" />
                    <FormInput label="Mô tả ngắn" name="shortDescription" placeholder="Mô tả hiển thị nhanh" />
                </div>

                {/* 2. LOẠI SẢN PHẨM & ĐỊNH LƯỢNG */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormSelect label="Thể Loại (Category)" name="category" options={categories.map(c => ({ label: c.name, value: c._id }))} />
                    <FormSelect label="Dành cho Thú cưng (Pet)" name="pet" options={pets.map(p => ({ label: p.name, value: p._id }))} />
                    <FormInput label="Thương hiệu (Brand)" name="brand" placeholder="Ví dụ: Royal Canin" />
                </div>

                {/* 3. GIÁ CẢ & TỒN KHO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput label="Giá bán (VNĐ)" name="price" type="number" placeholder="0" />
                    <FormInput label="Tồn kho" name="stock" type="number" placeholder="0" />
                </div>

                {/* 4. MÔ TẢ CHI TIẾT */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
                    <textarea
                        id="description"
                        {...methods.register('description')}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                </div>

                {/* 5. UPLOAD HÌNH ẢNH */}
                <ImageUploadSection name="thumbnail" label="Ảnh Thumbnail" isMultiple={false} />
                <ImageUploadSection name="images" label="Thư viện Ảnh" isMultiple={true} />

                {/* 6. NÚT SUBMIT */}
                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition duration-150"
                    >
                        {isLoading ? 'Đang xử lý...' : isEditMode ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
                    </button>
                </div>
            </form>
        </FormProvider>
    );
};

export default ProductForm;