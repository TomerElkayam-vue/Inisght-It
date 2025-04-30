import { Module } from '@nestjs/common';
import { ProjectsRepository } from './project.repository';
import { ProjectsSerivce } from './project.service';
import { ProjectsController } from './project.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsRepository, ProjectsSerivce],
  exports: [ProjectsSerivce],
})
export class ProjectsModule {}
