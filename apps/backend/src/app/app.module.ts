// filepath: /Users/nitzan/Documents/code/colman/Inisght-It/apps/backend/src/app/app.module.ts
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { JiraModule } from "./jira/jira.module";
import { ConfigModule } from "@nestjs/config";
import { jiraConfig } from "../config/jira-config";
import { GithubModule } from "./github/github.module";
import { githubConfig } from "../config/github-config";
import { AiModule } from "./ai/ai.module";
import { geminiConfig } from "../config/gemini-config";
import { ProjectsModule } from "./projects/project.module";
import { UsersModule } from "./users/user.module";
import { CacheModule } from "@nestjs/cache-manager";
import { EmployeeModule } from "./employee/employee.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CronModule } from "./cron/cron.module";

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
export class AppModule {}
