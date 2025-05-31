import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUserParams } from './dto/search-user-params.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    // Не возвращаем hash, только "безопасные" поля
    const { passwordHash, ...safe } = user.toObject();
    return safe;
  }

  @Get()
  async findAll(@Query() params: SearchUserParams) {
    const users = await this.userService.findAll(params);
    return users.map(u => {
      const { passwordHash, ...safe } = u.toObject();
      return safe;
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (!user) return null;
    const { passwordHash, ...safe } = user.toObject();
    return safe;
  }
}