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
      throw new ConflictException('Email уже существует');
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
const andFilters: any[] = []; // Фильтрация по роли и др. полям, если нужно
if (params.role) andFilters.push({ role: params.role }); // Если приходит id — точное совпадение
if (params.id) andFilters.push({ _id: params.id }); // Универсальный поиск q по ИЛИ
if (params.q && params.q.trim()) {
const q = params.q.trim();
const orFilters = [
{ name: { $regex: q, $options: 'i' } },
{ email: { $regex: q, $options: 'i' } },
{ contactPhone: { $regex: q, $options: 'i' } },
];
andFilters.push({ $or: orFilters });
} else {
// Поддержка старых отдельных фильтров при отсутствии q
if (params.email) andFilters.push({ email: { $regex: params.email, $options: 'i' } });
if (params.name) andFilters.push({ name: { $regex: params.name, $options: 'i' } });
if (params.contactPhone) andFilters.push({ contactPhone: { $regex: params.contactPhone, $options: 'i' } });
} const query = andFilters.length > 0 ? { $and: andFilters } : {}; return this.userModel
.find(query)
.limit(params.limit ?? 0)
.skip(params.offset ?? 0)
.exec();
}

async updateUser(id: string, updateData: UpdateUserDto): Promise<UserDocument | null> {
  const user = await this.userModel.findById(id).exec();
  if (!user) return null;

    // Проверка на уникальность email
  if (updateData.email) {
    const existingUser = await this.userModel.findOne({ email: updateData.email, _id: { $ne: id } }).exec();
    if (existingUser) {
      throw new ConflictException('Email уже существует');
    }
  }

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
