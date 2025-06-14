import { Module, forwardRef } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { GithubModule } from '../github/github.module';
import { JiraModule } from '../jira/jira.module';
import { AiModule } from '../ai/ai.module';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => GithubModule),
    forwardRef(() => JiraModule),
    AiModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeService],
})
export class EmployeeModule {}
