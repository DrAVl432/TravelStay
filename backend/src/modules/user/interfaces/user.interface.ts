//user.interface.ts
import { User, UserDocument } from '../schemas/user.schema';
import { SearchUserParams } from '../dto/search-user-params.dto';
//import { UpdateUserDto } from '../dto/update-user.dto';

export interface IUserService {
  create(data: Partial<UserDocument >): Promise<UserDocument >;
  findById(_id: string): Promise<UserDocument  | null>;
  findByEmail(email: string): Promise<UserDocument  | null>;
  findAll(params: SearchUserParams): Promise<UserDocument []>;
  
}