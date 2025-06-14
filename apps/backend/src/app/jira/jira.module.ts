import { forwardRef, Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { JiraRepository } from './jira.repository';
import { HttpModule } from '@nestjs/axios';
import { ProjectsModule } from '../projects/project.module';
import { EmployeeModule } from '../employee/employee.module';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [JiraController],
  providers: [JiraService, JiraRepository],
  imports: [
    ProjectsModule,
    forwardRef(() => EmployeeModule),
    HttpModule,
    forwardRef(() => AiModule),
  ],
  exports: [JiraService],
})
export class JiraModule {}
