import { User } from '../schemas/user.schema';
import { SearchUserParams } from '../dto/search-user-params.dto';

export interface IUserService {
  create(data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(params: SearchUserParams): Promise<User[]>;
}