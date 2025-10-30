import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // 1. Import HttpModule

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminSalesModule } from './admin-sales/admin-sales.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdminOrderModule } from './orders/orders.module';
import { ProductModule } from './product/product.module';
import { PetModule } from './pet/pet.module';
import { CategoryModule } from './category/category.module';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
    }),
    
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60 * 15,
      limit: 100,
    }]),

    HttpModule,
    AuthModule,
    UserModule,
    AdminSalesModule,
    AdminOrderModule,
    ProductModule,
    CategoryModule,
    PetModule,
    CouponModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}