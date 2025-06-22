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
        
        // Проверка на наличие пользователя
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return {
            email: user.email,
            name: user.name,
            contactPhone: user.contactPhone,
        };
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