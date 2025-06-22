import { User } from '../modules/user/schemas/user.schema';

declare global {
    namespace Express {
        interface Request {
            user?: User; // Добавьте свойство user
            logout(options?: any, done?: (err?: any) => void): void; // Обновляем так, чтобы соответствовать требуемым типам
        }
    }
}