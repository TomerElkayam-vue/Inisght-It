// filepath: /Users/nitzan/Documents/code/colman/Inisght-It/apps/backend/src/app/app.module.ts
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JiraModule } from './jira/jira.module';
import { ConfigModule } from '@nestjs/config';
import { jiraConfig } from '../config/jira-config';
import { GithubModule } from './github/github.module';
import { githubConfig } from '../config/github-config';
import { AiModule } from './ai/ai.module';
import { geminiConfig } from '../config/gemini-config';
import { ProjectsModule } from './projects/project.module';
import { UsersModule } from './users/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { EmployeeModule } from './employee/employee.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { ProjectSettingsMiddleware } from './middleware/project-settings.middleware';
import { JiraController } from './jira/jira.controller';
import { GithubController } from './github/github.controller';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ProjectsController } from './projects/project.controller';

@Module({
  imports: [
    JiraModule,
    GithubModule,
    ProjectsModule,
    UsersModule,
    AuthModule,
    AiModule,
    EmployeeModule,
    CronModule,
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes in milliseconds
    }),
    ConfigModule.forRoot({
      load: [jiraConfig, githubConfig, geminiConfig],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware, ProjectSettingsMiddleware)
      .exclude({ path: '*callback*', method: RequestMethod.ALL })
      .forRoutes(JiraController, GithubController);
    consumer.apply(AuthMiddleware).forRoutes(ProjectsController);
  }
  // apply on ProjectsController jus the AuthMiddleware
}
