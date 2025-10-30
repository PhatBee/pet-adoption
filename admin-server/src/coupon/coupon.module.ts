import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { UserCoupon, UserCouponSchema } from '../user/schemas/userCoupon.schema';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },

      { name: UserCoupon.name, schema: UserCouponSchema }, 
    ]),
    AuthModule,
    AdminGuard,
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}