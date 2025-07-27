//user.service.ts
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserParams } from './dto/search-user-params.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './enums/user-role.enum';
import { hash } from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserDto): Promise<UserDocument> {
    // Проверка на уникальность email
    const exists = await this.userModel.findOne({ email: data.email });
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    // Проверка на существование пароля
    if (!data.password) {
      throw new BadRequestException('Password is required');
    }

    // Логирование пароля перед хешированием для отладки
    console.log('Password to hash:', data.password);

    const passwordHash = await hash(data.password, 10);

    const user = new this.userModel({
      ...data,
      passwordHash,
      role: data.role ?? UserRole.CLIENT, // Роль по умолчанию
    });

    return user.save();
  }

 async findById(id: string): Promise<UserDocument | null> {
  console.log("Искомый ID:", id);
  console.log(`Проверка валидности ID: ${Types.ObjectId.isValid(id)}`);
    if (!Types.ObjectId.isValid(id)) {
      
        console.log(`ID неверный: ${id}`);
        return null; // Вы можете обработать ошибку, если идентификатор неверный
    }

    const user = await this.userModel.findById(id).exec();
    if (user) {
        console.log(`Найден пользователь: ${user}`);
    }
           if (!user) {
           console.log(`Пользователь не найден по ID: ${id}`);
       }
    return user;
}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(params: SearchUserParams): Promise<UserDocument[]> {
    const filter = [];
    if (params.email) filter.push({ email: { $regex: params.email, $options: 'i' } });
    if (params.name) filter.push({ name: { $regex: params.name, $options: 'i' } });
    if (params.contactPhone) filter.push({ contactPhone: { $regex: params.contactPhone, $options: 'i' } });
    if (params.role) filter.push({ role: params.role });
    const query = filter.length > 0 ? { $and: filter } : {};
    
    return this.userModel
      .find(query)
      .limit(params.limit ?? 0)
      .skip(params.offset ?? 0)
      .exec();
  }
async updateUser(id: string, updateData: UpdateUserDto): Promise<UserDocument | null> {
  const user = await this.userModel.findById(id).exec();
  if (!user) return null;

  // Проверка, изменился ли пароль
  if (updateData.password) {
    // Хешируем новый пароль
    const passwordHash = await hash(updateData.password, 10);
    user.passwordHash = passwordHash; // Записываем хешированный пароль
  }

  Object.assign(user, updateData);
  return user.save();
}

// async updateUser(id: string, updateData: UpdateUserDto, currentUserRole: UserRole): Promise<User | null> {
//      const user = await this.userModel.findById(id).exec();
//      if (!user) return null;
// добавим позже
//      // Проверим, что пользователь с ролью CLIENT не может менять свою роль
//      if (currentUserRole === UserRole.CLIENT) {
//        delete updateData.role; // Удаляем изменение роли
//      }

//      // Проверяем, что администратор может изменять только роль
//      if (currentUserRole === UserRole.ADMIN && updateData.role) {
//        user.role = updateData.role;
//      }

//      Object.assign(user, updateData);
//      return user.save();

// }
}
