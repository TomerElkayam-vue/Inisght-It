import {
  Get,
  Put,
  Post,
  Body,
  Param,
  Delete,
  Controller,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { Prisma, User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.getUser({ id });
  }

  @Post()
  async createUser(@Body() userData: Prisma.UserCreateInput): Promise<User> {
    return this.usersService.createUser(userData);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Prisma.UserUpdateInput
  ): Promise<User> {
    return this.usersService.updateUser({
      where: { id },
      data: userData,
    });
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.usersService.deleteUser({ id });
  }
}
