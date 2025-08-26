import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '../user/user.module';
import { SessionSerializer } from './session.serializer';

@Module({
imports: [
PassportModule.register({ session: true }),
UserModule,
],
providers: [AuthService, LocalStrategy, SessionSerializer],
controllers: [AuthController],
exports: [PassportModule, AuthService],
})
export class AuthModule {}