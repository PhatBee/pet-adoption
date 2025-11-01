"use client";

import React, { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CouponFormSchema, couponSchema } from '../../libs/validations/coupon.schema';
import { DISCOUNT_TYPE_OPTIONS, DiscountType } from '../../libs/constants';
import FormInput from '../common/FormInput';
import FormSelect from '../common/FormSelect';
import { formatToDateTimeLocal } from '../../libs/validations/helper';
import FormCombobox, { ComboboxOption } from '../common/FormCombobox'
import categoryApi from '../../store/api/categoryApi'; 
import petApi from '../../store/api/petApi';
import useSWR from 'swr';
import { BaseRef } from '../../types/next';

type Coupon = any;

interface CouponFormProps {
  defaultValues?: Coupon;
  onSubmit: (data: CouponFormSchema) => void;
  isLoading: boolean;
}

const fetcher = async (url: string): Promise<ComboboxOption[]> => {
  let data: BaseRef[];

  if (url.includes('categories')) {
    data = await categoryApi.findAll();
  } else if (url.includes('pet-types')) {
    data = await petApi.findAll();
  } else {
    return Promise.reject(new Error('Unknown fetcher URL'));
  }

  // *Phải* transform data ở đây
  return data.map(item => ({
    value: item._id,
    label: item.name,
  }));
};

const defaultFormValues: CouponFormSchema = {
  code: '',
  description: '',
  discountType: DiscountType.FIXED_AMOUNT, 
  discountValue: 0,
  maxDiscountValue: undefined,
  minOrderValue: 0,
  maxUses: undefined,
  usageLimitPerUser: undefined,
  startsAt: formatToDateTimeLocal(), 
  expiresAt: undefined,
  productIds: '',       
  categoryIds: [],      
  petTypeIds: [],
  isPublic: true,
  isActive: true,
};

const CouponForm: React.FC<CouponFormProps> = ({ defaultValues, onSubmit, isLoading }) => {

  const { data: categoryOptions, isLoading: isLoadingCategories } = useSWR<ComboboxOption[]>(
    '/admin/categories/list',
    fetcher
  );
  const { data: petOptions, isLoading: isLoadingPets } = useSWR<ComboboxOption[]>(
    '/admin/pet-types/list',
    fetcher
  );
  
  const formattedDefaultValues = defaultValues ? {
      ...defaultValues,
      productIds: defaultValues.productIds?.join(', ') || '',
      startsAt: formatToDateTimeLocal(defaultValues.startsAt),
      expiresAt: defaultValues.expiresAt ? formatToDateTimeLocal(defaultValues.expiresAt) : undefined,
  } : defaultFormValues;
    
  const resolver = zodResolver(couponSchema) as unknown as Resolver<CouponFormSchema>;

  const methods = useForm<CouponFormSchema>({
    resolver,
    defaultValues: formattedDefaultValues,
  });

  const { control, handleSubmit, register } = methods;

  const [applyToProducts, setApplyToProducts] = useState(!!formattedDefaultValues.productIds?.length);
  const [applyToCategories, setApplyToCategories] = useState(!!formattedDefaultValues.categoryIds?.length);
  const [applyToPets, setApplyToPets] = useState(!!formattedDefaultValues.petTypeIds?.length);

  const discountType = useWatch({ control, name: 'discountType' });

  const handleFormSubmit = (data: CouponFormSchema) => {
    const finalData = {
        ...data,
        productIds: applyToProducts ? data.productIds : '',
        categoryIds: applyToCategories ? data.categoryIds : [],
        petTypeIds: applyToPets ? data.petTypeIds : [],
    };
    onSubmit(finalData);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Mã Coupon" name="code" required />
            <FormSelect label="Loại giảm giá" name="discountType" options={DISCOUNT_TYPE_OPTIONS} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Giá trị giảm" name="discountValue" type="number" required />
            {/* Hiển thị có điều kiện */}
            {discountType === DiscountType.PERCENTAGE && (
                <FormInput label="Giảm tối đa (VNĐ)" name="maxDiscountValue" type="number" required />
            )}
        </div>

        <FormInput label="Mô tả" name="description" />
        <FormInput label="Đơn hàng tối thiểu" name="minOrderValue" type="number" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Tổng lượt sử dụng" name="maxUses" type="number" placeholder="Toàn sàn có..."/>
          <FormInput label="Giới hạn sử dụng" name="usageLimitPerUser" type="number" placeholder="Mỗi người có..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Ngày bắt đầu" name="startsAt" type="datetime-local" />
          <FormInput label="Ngày kết thúc" name="expiresAt" type="datetime-local" />
        </div>
        
        <hr className="my-4" />
        
        <div className="p-4 border rounded-md">
            <label className="flex items-center gap-2 mb-2">
                <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={applyToCategories}
                    onChange={(e) => setApplyToCategories(e.target.checked)}
                />
                Áp dụng cho Danh mục cụ thể
            </label>
            {applyToCategories && (
                <FormCombobox
                    name="categoryIds"
                    label=""
                    options={categoryOptions || []}
                    isLoading={isLoadingCategories}
                    placeholder="Tìm và chọn danh mục..."
                />
            )}
        </div>

        {/* 2. Áp dụng cho Loại Pet */}
        <div className="p-4 border rounded-md">
            <label className="flex items-center gap-2 mb-2">
                <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={applyToPets}
                    onChange={(e) => setApplyToPets(e.target.checked)}
                />
                Áp dụng cho Loại Pet cụ thể
            </label>
            {applyToPets && (
                <FormCombobox
                    name="petTypeIds"
                    label=""
                    options={petOptions || []}
                    isLoading={isLoadingPets}
                    placeholder="Tìm và chọn loại pet..."
                />
            )}
        </div>

        {/* 3. Áp dụng cho Sản phẩm */}
        <div className="p-4 border rounded-md">
            <label className="flex items-center gap-2 mb-2">
                <input 
                    type="checkbox" 
                    className="rounded" 
                    checked={applyToProducts}
                    onChange={(e) => setApplyToProducts(e.target.checked)}
                />
                Áp dụng cho Sản phẩm cụ thể (Nhập ID)
            </label>
            {applyToProducts && (
                <FormInput
                    label="Danh sách Product ID (cách nhau bằng dấu phẩy)"
                    name="productIds"
                />
            )}
        </div>

        {/* Checkbox cho isPublic và isActive */}
        <div className="flex gap-8">
            <label className="flex items-center gap-2">
                <input type="checkbox" {...methods.register('isPublic')} className="rounded" />
                Công khai
            </label>
            <label className="flex items-center gap-2">
                <input type="checkbox" {...methods.register('isActive')} className="rounded" />
                Kích hoạt
            </label>
        </div>


        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : (defaultValues ? 'Cập nhật' : 'Tạo mới')}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default CouponForm;