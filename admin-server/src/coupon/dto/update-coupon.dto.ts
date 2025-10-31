import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}