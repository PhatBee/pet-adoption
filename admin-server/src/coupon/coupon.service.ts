import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema } from 'mongoose';
import { Coupon, CouponApplyType, CouponDocument, DiscountType } from './schemas/coupon.schema';
import { UserCoupon, UserCouponDocument } from '../user/schemas/userCoupon.schema';
import { CartItemDto } from './dto/cart-item.dto';
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

    const newCoupon = new this.couponModel({
      ...createCouponDto,
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

    const updatedCoupon = await this.couponModel.findByIdAndUpdate(
      id,
      updateCouponDto,
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

    // Xóa tất cả các bản ghi trong ví của user (vì chưa ai dùng nên cũng chưa ai lưu)
    // (Phòng trường hợp user lưu mà chưa dùng)
    await this.userCouponModel.deleteMany({ couponId: id });

    return { message: 'Đã xóa vĩnh viễn coupon thành công.' };
  }

  async getPublicCoupons(userId: string): Promise<Coupon[]> {
    const now = new Date();

    // 1. Lấy danh sách ID các coupon mà user ĐÃ LƯU
    const userSavedCoupons = await this.userCouponModel.find(
      { userId },
      { couponId: 1 },
    );
    const savedCouponIds = userSavedCoupons.map((c) => c.couponId);

    // 2. Tìm tất cả các coupon CÔNG KHAI, CÒN HẠN, CÒN LƯỢT
    // và KHÔNG NẰM TRONG danh sách user đã lưu
    const publicCoupons = await this.couponModel.find({
      isPublic: true,
      isActive: true,
      _id: { $nin: savedCouponIds },

      $and: [
        {
          $or: [
            { expiresAt: null },
            { expiresAt: { $gt: now } },
          ],
        },
        {
          $or: [
            { maxUses: null },
            { maxUses: 0 },
            { $expr: { $lt: ['$usesCount', '$maxUses'] } },
          ],
        },
      ],
    });

    return publicCoupons;
  }

  /**
   * Cho phép người dùng lưu mã giảm giá vào ví cá nhân
   * @param userId ID của người dùng
   * @param couponCode Mã code của coupon
   */

  async saveCouponToWallet(userId: string, couponCode: string): Promise<UserCoupon> {
    const coupon = await this.findCouponByCode(couponCode);

    this.validateCouponEligibility(coupon);

    const existingUserCoupon = await this.userCouponModel.findOne({
      userId,
      couponId: coupon._id,
    });

    if (existingUserCoupon) {
      if (existingUserCoupon.isUsed) {
        throw new BadRequestException('Bạn đã sử dụng mã này rồi.');
      }
      return existingUserCoupon;
    }

    const newUserCoupon = new this.userCouponModel({
      userId,
      couponId: coupon._id,
      isUsed: false,
    });

    try {
      return await newUserCoupon.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Bạn đã lưu mã này rồi.');
      }
      throw error;
    }
  }

  // --- B. ÁP DỤNG MÃ (Kiểm tra tại giỏ hàng) ---

  /**
   * Tính toán chi tiết giảm giá khi áp dụng tại giỏ hàng.
   * @param userId ID người dùng
   * @param couponCode Mã code
   * @param cartItems Danh sách các sản phẩm trong giỏ hàng
   */
  async applyCoupon(userId: string, couponCode: string, cartItems: CartItemDto[]) {
    const coupon = await this.findCouponByCode(couponCode);
    const userCoupon = await this.findUserCoupon(userId, coupon._id);

    this.validateCouponEligibility(coupon);

    if (userCoupon.isUsed) {
      throw new BadRequestException('Bạn đã dùng mã này rồi.');
    }

    const cartTotal = this.calculateCartTotal(cartItems);

    if (cartTotal < coupon.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString(
          'vi-VN',
        )}đ để áp dụng mã này.`,
      );
    }

    const eligibleTotal = this.calculateEligibleTotal(cartItems, coupon);
    if (eligibleTotal === 0) {
      throw new BadRequestException(
        'Mã không áp dụng cho các sản phẩm trong giỏ hàng của bạn.',
      );
    }

    const discountAmount = this.calculateDiscount(eligibleTotal, coupon);

    // 8. Trả về kết quả
    return {
      discountAmount,
      originalTotal: cartTotal,
      finalTotal: cartTotal - discountAmount,
      message: 'Áp dụng mã giảm giá thành công.',
    };
  }

  // --- C. SỬ DỤNG MÃ (Sau khi đặt hàng thành công) ---

  /**
   * Đánh dấu mã là đã sử dụng.
   * Hàm này nên được gọi bởi OrderService SAU KHI đơn hàng được tạo thành công.
   * @param userCouponId ID của bản ghi UserCoupon (lấy từ ví user)
   * @param couponId ID của mã Coupon gốc
   */
  async markCouponAsUsed(userCouponId: MongooseSchema.Types.ObjectId, couponId: MongooseSchema.Types.ObjectId): Promise<void> {

    // 1. Đánh dấu trong ví user
    await this.userCouponModel.updateOne(
      { _id: userCouponId, isUsed: false }, // Đảm bảo chưa dùng
      {
        $set: {
          isUsed: true,
          usedAt: new Date(),
        },
      },
    );

    // 2. Tăng bộ đếm sử dụng toàn cục
    await this.couponModel.updateOne(
      { _id: couponId },
      {
        $inc: { usesCount: 1 },
      },
    );
  }

  /** Tìm mã theo code, ném lỗi 404 nếu không thấy */
  private async findCouponByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponModel.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      throw new NotFoundException('Mã giảm giá không tồn tại.');
    }
    return coupon;
  }

  /** Tìm mã trong ví user, ném lỗi 404 nếu không thấy */
  private async findUserCoupon(userId: string, couponId: MongooseSchema.Types.ObjectId): Promise<UserCouponDocument> {
    const userCoupon = await this.userCouponModel.findOne({ userId, couponId });
    if (!userCoupon) {
      throw new NotFoundException('Bạn chưa thu thập mã giảm giá này.');
    }
    return userCoupon;
  }

  /** Kiểm tra các điều kiện chung của mã (active, date, usage) */
  private validateCouponEligibility(coupon: CouponDocument): void {
    if (!coupon.isActive) {
      throw new BadRequestException('Mã giảm không hợp lệ.');
    }

    const now = new Date();
    if (now < coupon.startsAt) {
      throw new BadRequestException('Chưa đến ngày áp dụng ưu đãi.');
    }

    if (now > coupon.expiresAt) {
      throw new BadRequestException('Mã giảm giá đã hết hạn.');
    }

    if (coupon.maxUses > 0 && coupon.usesCount >= coupon.maxUses) {
      throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng.');
    }
  }

  /** Tính tổng giá trị giỏ hàng */
  private calculateCartTotal(cartItems: CartItemDto[]): number {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }

  /** Lọc và tính tổng giá trị các sản phẩm hợp lệ theo quy tắc */
  private calculateEligibleTotal(cartItems: CartItemDto[], coupon: CouponDocument): number {
    const productIds = new Set(coupon.productIds.map(String));
    const categoryIds = new Set(coupon.categoryIds.map(String));
    const petTypeIds = new Set(coupon.petTypeIds.map(String));

    if (productIds.size === 0 && categoryIds.size === 0 && petTypeIds.size === 0) {
      return this.calculateCartTotal(cartItems);
    }

    const eligibleItems = cartItems.filter((item) => {
      // Nếu mảng productIds có giá trị, item PHẢI khớp
      if (productIds.size > 0 && !productIds.has(item.productId.toString())) {
        return false; // Không khớp product
      }

      // Nếu mảng categoryIds có giá trị, item PHẢI khớp
      if (categoryIds.size > 0 && !categoryIds.has(item.categoryId.toString())) {
        return false; // Không khớp category
      }

      // Nếu mảng petTypeIds có giá trị, item PHẢI khớp
      if (petTypeIds.size > 0 && !petTypeIds.has(item.petTypeId.toString())) {
        return false; // Không khớp pet type
      }

      // Nếu item vượt qua tất cả các điều kiện (hoặc mảng rỗng)
      return true;
    });

    return this.calculateCartTotal(eligibleItems);
  }

  /** Tính số tiền giảm cuối cùng */
  private calculateDiscount(eligibleTotal: number, coupon: CouponDocument): number {
    let discountAmount = 0;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discountAmount = eligibleTotal * (coupon.discountValue / 100);

      // Kiểm tra mức giảm tối đa
      if (coupon.maxDiscountValue > 0 && discountAmount > coupon.maxDiscountValue) {
        discountAmount = coupon.maxDiscountValue;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return Math.min(discountAmount, eligibleTotal);
  }
}