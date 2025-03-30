import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { GitHubModule } from './github/github.module.js';
import { AuthModule } from "../auth/auth.module.js";

@Module({
  imports: [AuthModule, GitHubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
