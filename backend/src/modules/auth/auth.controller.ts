import { Controller, Post, Req, UseGuards, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}

// LocalStrategy валидирует пользователя и кладет в req.user
@UseGuards(AuthGuard('local'))
@Post('login')
async login(@Req() req: Request, @Body() _dto: LoginDto) {
if (!req.user) throw new UnauthorizedException('Invalid credentials');
// возвращаем безопасные поля
const u: any = req.user;
return {
id: u._id?.toString?.() ?? u.id?.toString?.(),
email: u.email,
name: u.name,
contactPhone: u.contactPhone,
role: u.role,
};
}

@Post('logout')
async logout(@Req() req: Request): Promise<{ ok: true }> {
return new Promise((resolve, reject) => {
// @types/passport добавляет сигнатуру logout(cb)
req.logout((err: any) => {
if (err) return reject(err);
// Уничтожаем сессию после logout
if (req.session) {
req.session.destroy(() => resolve({ ok: true }));
} else {
resolve({ ok: true });
}
});
});
}

}