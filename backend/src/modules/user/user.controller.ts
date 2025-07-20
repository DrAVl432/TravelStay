//user.controller.ts
import { Controller, Get, Post, Body, Put, Query, Param, NotFoundException} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserParams } from './dto/search-user-params.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './schemas/user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    // Не возвращаем hash, только "безопасные" поля
    const { passwordHash, ...safe } = user.toObject() // Мы можем использовать user напрямую
    return safe;
  }

  @Get()
  async findAll(@Query() params: SearchUserParams) {
    const users = await this.userService.findAll(params);
    return users.map(u => {
      const { passwordHash, ...safe } = u.toObject(); // Мы можем использовать u напрямую
      return safe;
    });
  }

   @Get(':id')
   async findById(@Param('id') id: string) {
       console.log(`Извлечение пользователя с идентификатором: ${id}`);
       const user = await this.userService.findById(id);
       if (!user) {
           throw new NotFoundException(`Пользователь не найден с ID: ${id}`);
       }
       return { ...user.toObject(), passwordHash: undefined }; // Не возвращаем хеш пароля
   }
  
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
      const user = await this.userService.updateUser(id, updateUserDto);
      if (!user) {
          throw new NotFoundException(`Пользователь не найден с ID: ${id}`);
      }
      const { passwordHash, ...safe } = user.toObject();
      return { id: user._id, ...safe };
  }
  
}