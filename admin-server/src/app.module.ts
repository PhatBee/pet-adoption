import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { JwtModule } from '@nestjs/jwt';

import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { AutoRefreshMiddleware } from './auth/auto-refresh.middleware';



@Module({
  imports: [

    MongooseModule.forRoot(process.env.DB_URI || ""),
    JwtModule.register({}),

    OrdersModule,

    AuthModule,

    UsersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AutoRefreshMiddleware)
      // Áp middleware cho các route cần bảo vệ. Ví dụ áp cho tất cả route bắt đầu bằng /admin
      .forRoutes({ path: '/admin/*', method: RequestMethod.ALL });
  }
}
