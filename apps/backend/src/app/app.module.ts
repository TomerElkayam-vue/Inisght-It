// filepath: /Users/nitzan/Documents/code/colman/Inisght-It/apps/backend/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JiraModule } from './jira/jira.module';
import { ConfigModule } from '@nestjs/config';
import { jiraConfig } from '../config/jira-config';
import { GithubModule } from './github/github.module';
import { githubConfig } from '../config/github-config';

@Module({
  imports: [
    JiraModule,
    GithubModule,
    // AuthModule,
    ConfigModule.forRoot({ 
      load: [jiraConfig, githubConfig], 
      isGlobal: true 
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
