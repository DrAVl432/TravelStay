  // update-user.dto.ts
   import {
     IsEmail,
     IsString,
     IsOptional,
     IsEnum,
     MinLength,
   } from 'class-validator';
   import { UserRole } from '../enums/user-role.enum';

   export class UpdateUserDto {
     @IsOptional()
     @IsEmail()
     email?: string;

     @IsOptional()
     @IsString()
     @MinLength(6)
     password?: string;

     @IsOptional()
     @IsString()
     @MinLength(2)
     name?: string;

     @IsOptional()
     @IsString()
     contactPhone?: string;

     @IsOptional()
     @IsEnum(UserRole)
     role?: UserRole;

   }