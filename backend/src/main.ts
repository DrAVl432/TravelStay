import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
const app = await NestFactory.create(AppModule);

app.enableCors({
origin: ['http://localhost:3000', 'http://localhost:3050'],
credentials: true,
methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
allowedHeaders: ['Content-Type','Authorization'],
});

app.use(cookieParser(process.env.COOKIE_SECRET || 'dev_secret'));

app.use(
session({
secret: process.env.SESSION_SECRET || 'dev_session_secret',
resave: false,
saveUninitialized: false,
cookie: {
httpOnly: true,
secure: false, // true в проде с HTTPS
sameSite: 'lax',
maxAge: 7 * 24 * 60 * 60 * 1000,
},
})
);

app.use((req: Request, res: Response, next: NextFunction) => {
res.setHeader(
'Content-Security-Policy',
"default-src 'self'; connect-src 'self' http://localhost:3000 ws://localhost:3000"
);
next();
});

app.setGlobalPrefix('api');
app.useGlobalPipes(
new ValidationPipe({
whitelist: true,
forbidNonWhitelisted: true,
transform: true,
})
);

await app.listen(process.env.PORT || 3000);
}
bootstrap();