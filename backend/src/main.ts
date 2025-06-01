import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
     const app = await NestFactory.create(AppModule);
     app.setGlobalPrefix('api');
     await app.listen(process.env.HTTP_PORT || 3002, process.env.HTTP_HOST || '0.0.0.0');
}
bootstrap();