// src/main.ts (NestJS)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:6060', 
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`Admin server is running on port ${PORT}`);
}
bootstrap();