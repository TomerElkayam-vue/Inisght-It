import { Module } from '@nestjs/common';
import { UsersRepository } from './user.repository';
import { UsersService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
