import { Controller, Post, Request, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';
import { LoginDto } from './dto/login.dto'; 
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<any> {
        const user = await this.authService.login(loginDto.email, loginDto.password);
        
        // Логирование пользователя для отладки
        console.log('Logged in user:', user); // Логируем объект пользователя

        // Проверка на наличие пользователя
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

            if (!user._id) {
            console.error('User _id is undefined:', user);
            throw new UnauthorizedException('User _id is undefined');
        }

        const response = {
            id: user._id.toString(), // Преобразуем ObjectId в строку
            email: user.email,
            name: user.name,
            contactPhone: user.contactPhone,
            role: user.role
        };

        // Логируем ответ перед возвратом
        console.log('Returning user data:', response); // Логируем данные пользователи, которые будут возвращены

        return response;
    }

    @Post('logout')
    @UseGuards(AuthGuard('local'))
    async logout(@Request() req: ExpressRequest): Promise<void> {
        req.logout((err: any) => { // Явно указываем тип параметра err
            if (err) {
                console.error('Logout error:', err);
                throw new Error('Failed to logout');
            }
        });
    }
}