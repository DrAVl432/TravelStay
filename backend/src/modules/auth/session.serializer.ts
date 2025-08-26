import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class SessionSerializer extends PassportSerializer {
constructor(private readonly usersService: UserService) {
super();
}

serializeUser(user: User, done: (err: any, id?: any) => void) {
done(null, user.id);
}

async deserializeUser(id: string, done: (err: any, user?: any) => void) {
try {
const user = await this.usersService.findById(id);
done(null, user || null);
} catch (e) {
done(e);
}
}
}