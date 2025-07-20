// UserInfo.ts
import { UserRole } from '../enums/user-role.enum';
export interface UserInfo {
    _id?: string;
    email?: string;
    name?: string;
    contactPhone?: string;
    password?: string;
    role?: UserRole;
}