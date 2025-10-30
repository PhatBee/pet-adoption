import {
    Controller, Post, Body, Get, Param, Patch, Delete, Query,
    UsePipes, ValidationPipe, UseGuards, // (Nên thêm AdminAuthGuard)
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto, UpdateCouponDto } from './dto/coupon.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('admin/coupons')
@UseGuards(AuthGuard, AdminGuard)
export class CouponController {
    constructor(private readonly couponService: CouponService) { }

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    create(@Body() createCouponDto: CreateCouponDto) {
        return this.couponService.createCoupon(createCouponDto);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.couponService.findAllCoupons(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.couponService.findOneCoupon(id);
    }

    @Patch(':id')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
        return this.couponService.updateCoupon(id, updateCouponDto);
    }
    
    @Patch(':id/disable')
    disable(@Param('id') id: string) {
        return this.couponService.disableCoupon(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.couponService.deleteCoupon(id);
    }
}