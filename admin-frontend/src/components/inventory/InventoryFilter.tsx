// InventoryFilter.tsx

"use client";
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import { InventoryQueryDto, InventorySortBy } from '../../types/inventory.dto';
import { ComboboxOption } from '../../types/next';

const SORT_OPTIONS = [
    { value: InventorySortBy.NEWEST, label: 'Sản phẩm mới nhất' },
    { value: InventorySortBy.OLDEST, label: 'Sản phẩm cũ nhất' },
    { value: InventorySortBy.MOST_STOCK, label: 'Tồn kho (Nhiều nhất)' },
    { value: InventorySortBy.LEAST_STOCK, label: 'Tồn kho (Ít nhất)' },
    { value: InventorySortBy.NAME, label: 'Tên sản phẩm (A-Z)' },
];

interface InventoryFilterProps {
    onFilterChange: (query: Partial<InventoryQueryDto>) => void;
    categoryOptions: ComboboxOption[];
    petOptions: ComboboxOption[];
    initialQuery: Partial<InventoryQueryDto>;
}

const InventoryFilter: React.FC<InventoryFilterProps> = ({ 
    onFilterChange, 
    categoryOptions, 
    petOptions,
    initialQuery
}) => {
    const methods = useForm<Partial<InventoryQueryDto>>({
        defaultValues: initialQuery,
    });
    const { watch } = methods;

    const watchedFields = watch();
    const { sortBy, search, categoryId, petId } = watchedFields;

    // Hàm xác định SortOrder ngầm định (dựa trên logic backend)
    const getSortOrder = (sortByValue: InventorySortBy): 'asc' | 'desc' => {
        switch (sortByValue) {
            case InventorySortBy.OLDEST:
            case InventorySortBy.LEAST_STOCK:
            case InventorySortBy.NAME:
                return 'asc';
            case InventorySortBy.NEWEST:
            case InventorySortBy.MOST_STOCK:
            default:
                return 'desc';
        }
    };

    // Gửi query mới mỗi khi các trường thay đổi
    useEffect(() => {

        const newQuery: Partial<InventoryQueryDto> = {
            search,
            categoryId: categoryId || undefined,
            petId: petId || undefined,
            sortBy,
        };
        
        // Tự động thêm sortOrder dựa trên sortBy
        if (sortBy) {
             newQuery.sortOrder = getSortOrder(sortBy as InventorySortBy);
        } else {
             newQuery.sortOrder = undefined;
        }

        // Gửi query lên page cha
        onFilterChange(newQuery);

    }, [search, categoryId, petId, sortBy, onFilterChange]);


    const categoryFilterOptions = [{ value: '', label: 'Tất cả Danh mục' }, ...categoryOptions];
    const petFilterOptions = [{ value: '', label: 'Tất cả Loại Pet' }, ...petOptions];
    const sortFilterOptions = [{ value: '', label: 'Mặc định (Ngày nhập)' }, ...SORT_OPTIONS];

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

                {/* Lọc theo Category (Sử dụng FormSelect) */}
                <div className="w-full sm:w-auto">
                    <FormSelect 
                        label="Lọc theo Danh mục"
                        name="categoryId"
                        options={categoryFilterOptions}
                    />
                </div>
                
                {/* Lọc theo Pet Type (Sử dụng FormSelect) */}
                <div className="w-full sm:w-auto">
                    <FormSelect 
                        label="Lọc theo Loại Pet"
                        name="petId"
                        options={petFilterOptions}
                    />
                </div>
            </div>
        </FormProvider>
    );
};

export default InventoryFilter;