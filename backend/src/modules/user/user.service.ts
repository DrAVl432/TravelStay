import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserParams } from './dto/search-user-params.dto';
import { UserRole } from './enums/user-role.enum';  // <-- новый путь
import { hash } from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    // Проверка на уникальность email
    const exists = await this.userModel.findOne({ email: data.email });
    if (exists) throw new ConflictException('Email already exists');

    const passwordHash = await hash(data.password, 10);

    const user = new this.userModel({
      ...data,
      passwordHash,
      role: data.role ?? UserRole.CLIENT, // роль по умолчанию
    });

    return user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(params: SearchUserParams): Promise<User[]> {
    const filter = [];
    if (params.email) filter.push({ email: { $regex: params.email, $options: 'i' } });
    if (params.name) filter.push({ name: { $regex: params.name, $options: 'i' } });
    if (params.contactPhone) filter.push({ contactPhone: { $regex: params.contactPhone, $options: 'i' } });

    const query = filter.length > 0 ? { $and: filter } : {};

    return this.userModel
      .find(query)
      .limit(params.limit ?? 0)
      .skip(params.offset ?? 0)
      .exec();
  }
}