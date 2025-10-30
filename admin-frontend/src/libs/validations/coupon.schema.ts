import { z } from "zod";
import { DiscountType } from "../constants";
import { numericField, formatToDateTimeLocal } from "./helper";

export const couponSchema = z.object({
  code: z.string().min(3, "Mã phải có ít nhất 3 ký tự").toUpperCase(),
  description: z.string().optional(),

  discountType: z.nativeEnum(DiscountType),

  discountValue: numericField(0, "Giá trị phải lớn hơn 0"),

  maxDiscountValue: numericField(0).optional(),
  minOrderValue: numericField(0).default(0),
  maxUses: numericField(1, "Phải lớn hơn 0").optional(),

  startsAt: z.string().default(formatToDateTimeLocal()),
  expiresAt: z.string().optional(),

  productIds: z.string ().optional().default(''),
  categoryIds: z.array(z.string()).optional().default([]),
  petTypeIds: z.array(z.string()).optional().default([]),

  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
})
.refine((data) => {
  if (data.discountType === DiscountType.PERCENTAGE) {
    return data.maxDiscountValue !== undefined && data.maxDiscountValue > 0;
  }
  return true;
}, {
  message: "Giá trị giảm tối đa là bắt buộc khi giảm theo %",
  path: ["maxDiscountValue"],
})
.refine((data) => {
  if (data.startsAt && data.expiresAt) {
    return new Date(data.expiresAt) > new Date(data.startsAt);
  }
  return true;
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["expiresAt"],
});

export type CouponFormSchema = z.infer<typeof couponSchema>;
