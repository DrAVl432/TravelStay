   import { NestFactory } from '@nestjs/core';
   import { AppModule } from './app.module';
   import { ValidationPipe } from '@nestjs/common';
   import * as cors from 'cors';

   async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     app.enableCors();
     app.setGlobalPrefix('api');
     app.useGlobalPipes(new ValidationPipe({
       whitelist: true,          // отбрасывает все неописанные в DTO поля
       forbidNonWhitelisted: true, // отдаёт 400, если пришло нежданное поле
       transform: true,
     }));
     await app.listen(process.env.PORT || 3000);
   }
   bootstrap();