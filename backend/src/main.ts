import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import * as express from 'express';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3050'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser(process.env.COOKIE_SECRET || 'dev_secret'));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:3000",
    );
    next();
  });

  // Путь к загрузкам из .env или по умолчанию static/uploads в корне процесса
  const uploadDirFromEnv = process.env.UPLOAD_DIR || 'static/uploads';
  const uploadPath = join(process.cwd(), uploadDirFromEnv);

  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
  }

  // Раздача всей статики из папки static с префиксом /static
  const staticRoot = join(process.cwd(), 'static');
  if (!existsSync(staticRoot)) {
    mkdirSync(staticRoot, { recursive: true });
  }
  app.use('/static', express.static(staticRoot));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();