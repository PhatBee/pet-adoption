export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export enum CouponApplyType {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  SPECIFIC_PET_TYPES = 'specific_pet_types',
}

export const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Giảm theo %', value: DiscountType.PERCENTAGE },
  { label: 'Giảm số tiền cố định', value: DiscountType.FIXED_AMOUNT },
];

export const APPLY_TYPE_OPTIONS = [
  { label: 'Tất cả sản phẩm', value: CouponApplyType.ALL_PRODUCTS },
  { label: 'Sản phẩm cụ thể', value: CouponApplyType.SPECIFIC_PRODUCTS },
  { label: 'Danh mục cụ thể', value: CouponApplyType.SPECIFIC_CATEGORIES },
  { label: 'Loại thú cưng cụ thể', value: CouponApplyType.SPECIFIC_PET_TYPES },
];