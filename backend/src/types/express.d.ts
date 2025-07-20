//express.d.ts
//import { UserRole } from '../modules/user/enums/user-role.enum';
import { User, UserDocument } from '../modules/user/schemas/user.schema';

declare global {
    namespace Express {
        interface Request {
            user?: User; // Добавьте свойство user
            //role?: User;
            logout(options?: any, done?: (err?: any) => void): void; // Обновляем так, чтобы соответствовать требуемым типам
        }
    }
}