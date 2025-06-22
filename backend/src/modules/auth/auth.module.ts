import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '../user/user.module';

@Module({
    imports: [PassportModule, UserModule],
    providers: [AuthService, LocalStrategy],
    controllers: [AuthController]
})
export class AuthModule {}