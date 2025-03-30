import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitHubModule } from './github/github.module';
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule, GitHubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
