"use client";
import React, { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import { ProductQueryDto } from '../../types/next';
import { ComboboxOption } from '../../types/next';

interface ProductFilterProps {
    onQueryChange: (query: Partial<ProductQueryDto>) => void;
    categoryOptions: ComboboxOption[];
    petOptions: ComboboxOption[];
    initialQuery: Partial<ProductQueryDto>;
}

const STATUS_OPTIONS: ComboboxOption[] = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "true", label: "Đang kinh doanh" },
    { value: "false", label: "Đã vô hiệu hóa" }
];

interface ProductFilterForm {
    search?: string;
    categoryId?: string;
    petId?: string;
    isActive: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({ 
    onQueryChange, 
    categoryOptions, 
    petOptions,
    initialQuery
}) => {
    const methods = useForm<ProductFilterForm>({
        defaultValues: {
            search: initialQuery.search || '',
            categoryId: initialQuery.categoryId || '',
            petId: initialQuery.petId || '',
            isActive: initialQuery.isActive === undefined ? "all" : String(initialQuery.isActive),
        },
    });
    const { watch } = methods;

    const isMounted = useRef(false);
    const watchedFields = watch();
    const { search, categoryId, petId, isActive } = watchedFields;

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return; 
        }

        const newQuery: Partial<ProductQueryDto> = {
            search,
            categoryId: categoryId || undefined,
            petId: petId || undefined,
            isActive: isActive === "all" ? undefined : (isActive === "true"),
        };
        
        onQueryChange(newQuery);

    }, [search, categoryId, petId, isActive, onQueryChange]);


    const categoryFilterOptions = [{ value: '', label: 'Tất cả Danh mục' }, ...categoryOptions];
    const petFilterOptions = [{ value: '', label: 'Tất cả Loại Pet' }, ...petOptions];

    return (
        <FormProvider {...methods}> 
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-inner">
                {/* Input Tìm kiếm */}
                <div className="w-full sm:w-auto flex-grow">
                    <FormInput 
                        label="Tìm kiếm sản phẩm" 
                        name="search" 
                        placeholder="Nhập tên sản phẩm..."
                    />
                </div>

                {/* Lọc theo Category */}
                <div className="w-full sm:w-auto">
                    <FormSelect 
                        label="Lọc theo Danh mục"
                        name="categoryId"
                        options={categoryFilterOptions}
                    />
                </div>
                
                <div className="w-full sm:w-auto">
                    <FormSelect 
                        label="Lọc theo Loại Pet"
                        name="petId"
                        options={petFilterOptions}
                    />
                </div>

                <div className="w-full sm:w-auto">
                    <FormSelect 
                        label="Lọc theo Trạng thái"
                        name="isActive"
                        options={STATUS_OPTIONS}
                    />
                </div>
            </div>
        </FormProvider>
    );
};

export default ProductFilter;