// filepath: /Users/nitzan/Documents/code/colman/Inisght-It/apps/backend/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JiraModule } from './jira/jira.module';
import { ConfigModule } from '@nestjs/config';
import { jiraConfig } from '../config/jira-config';
import { AiModule } from './ai/ai.module';
import { geminiConfig } from '../config/gemini-config';

@Module({
  imports: [
    JiraModule,
    AuthModule,
    AiModule,
    ConfigModule.forRoot({ load: [jiraConfig, geminiConfig], isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
