import 'express-session';
import { UserDocument } from '../modules/user/schemas/user.schema';

declare module 'express-session' {
interface SessionData {
passport?: { user: string }; // хранится id пользователя
}
}

declare module 'express-serve-static-types' {
interface Request {
user?: UserDocument | null;
logout(callback: (err: any) => void): void;
logOut(callback: (err: any) => void): void;
}
}
declare namespace Express {
    interface Multer {
      File: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      };
    }
  }
  declare module 'cookie-parser';