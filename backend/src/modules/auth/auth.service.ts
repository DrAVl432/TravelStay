// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async login(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await compare(password, user.passwordHash))) {
        return null; // Возвращаем null, если пользователь не найден или пароль неверный
    }
    return user;
}

    async logout(userId: string): Promise<void> {
        // Удаление сессии или логика выхода
        console.log(`User ${userId} has logged out.`);
    }
    async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await compare(password, user.passwordHash))) {
        return null; // Неверные данные
    }
    return user; // Возвращаем только пользователя без пароля
    }
}