import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { UserCoupon, UserCouponDocument } from '../user/schemas/userCoupon.schema';
import { CreateCouponDto, UpdateCouponDto, CouponQueryDto, PaginatedResult } from './dto/coupon.dto';
import { FilterQuery } from 'mongoose';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(UserCoupon.name) private userCouponModel: Model<UserCouponDocument>,
  ) { }

  async findAllCoupons(
    query: CouponQueryDto,
  ): Promise<PaginatedResult<Coupon>> {
    const {
      page = 1,
      limit = 10,
      code,
      isActive
    } = query;

    const filter: FilterQuery<CouponDocument> = {};
    if (code) {
      filter.code = { $regex: code, $options: 'i' };
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const totalItems = await this.couponModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    const data = await this.couponModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data,
      totalItems,
      totalPages,
      currentPage: page,
    };
  }

  async findOneCoupon(id: string): Promise<Coupon> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Không tìm thấy mã giảm.');
    }
    return coupon;
  }

  private determineApplyType(dto: CreateCouponDto | UpdateCouponDto) {
    const hasProducts = dto.productIds && dto.productIds.length > 0;
    const hasCategories = dto.categoryIds && dto.categoryIds.length > 0;
    const hasPets = dto.petTypeIds && dto.petTypeIds.length > 0;

    // Nếu có sản phẩm cụ thể → áp dụng cho sản phẩm
    if (hasProducts) {
      return {
        appliesTo: 'specific_products',
        productIds: dto.productIds,
        categoryIds: [],
        petTypeIds: [],
      };
    }

    // Nếu có cả category và pet → áp dụng AND (merge)
    if (hasCategories && hasPets) {
      return {
        appliesTo: 'specific_categories_and_pet_types',
        productIds: [],
        categoryIds: dto.categoryIds,
        petTypeIds: dto.petTypeIds,
      };
    }

    // Nếu chỉ có category
    if (hasCategories) {
      return {
        appliesTo: 'specific_categories',
        productIds: [],
        categoryIds: dto.categoryIds,
        petTypeIds: [],
      };
    }

    // Nếu chỉ có pet
    if (hasPets) {
      return {
        appliesTo: 'specific_pet_types',
        productIds: [],
        categoryIds: [],
        petTypeIds: dto.petTypeIds,
      };
    }

    // Không chọn gì → toàn sàn
    return {
      appliesTo: 'all_products',
      productIds: [],
      categoryIds: [],
      petTypeIds: [],
    };
  }

  async createCoupon(createCouponDto: CreateCouponDto): Promise<Coupon> {
    const uppercaseCode = createCouponDto.code.toUpperCase();

    const existingCoupon = await this.couponModel.findOne({
      code: uppercaseCode,
    });
    if (existingCoupon) {
      throw new ConflictException('Mã coupon này đã tồn tại.');
    }

    if (
      createCouponDto.expiresAt &&
      createCouponDto.startsAt &&
      new Date(createCouponDto.expiresAt) <= new Date(createCouponDto.startsAt)
    ) {
      throw new BadRequestException('Ngày hết hạn phải sau ngày bắt đầu.');
    }

    const applyData = this.determineApplyType(createCouponDto);

    const newCoupon = new this.couponModel({
      ...createCouponDto,
      ...applyData,
      code: uppercaseCode,
    });
    return newCoupon.save();
  }

  async updateCoupon(
    id: string,
    updateCouponDto: UpdateCouponDto,
  ): Promise<Coupon> {
    if (updateCouponDto.code) {
      updateCouponDto.code = updateCouponDto.code.toUpperCase();

      const existingCoupon = await this.couponModel.findOne({
        code: updateCouponDto.code,
        _id: { $ne: id },
      });
      if (existingCoupon) {
        throw new ConflictException('Mã coupon này đã tồn tại.');
      }
    }

    const applyData = this.determineApplyType(updateCouponDto);

    const updatedCoupon = await this.couponModel.findByIdAndUpdate(
      id,
      {updateCouponDto, ...applyData},
      { new: true },
    );

    if (!updatedCoupon) {
      throw new NotFoundException('Không tìm thấy coupon để cập nhật.');
    }
    return updatedCoupon;
  }

  async disableCoupon(id: string): Promise<Coupon> {
    const updatedCoupon = await this.couponModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true },
    );

    if (!updatedCoupon) {
      throw new NotFoundException('Không tìm thấy coupon.');
    }

    return updatedCoupon;
  }

  async deleteCoupon(id: string): Promise<{ message: string }> {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) {
      throw new NotFoundException('Không tìm thấy coupon.');
    }

    if (coupon.usesCount > 0) {
      throw new BadRequestException(
        'Không thể xóa mã đã có lượt sử dụng. Vui lòng "Vô hiệu hóa" (disable) mã này.',
      );
    }
    await this.couponModel.deleteOne({ _id: id });
    await this.userCouponModel.deleteMany({ couponId: id });
    return { message: 'Đã xóa vĩnh viễn coupon thành công.' };
  }
}