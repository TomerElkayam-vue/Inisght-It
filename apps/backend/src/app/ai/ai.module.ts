import { forwardRef, Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRepository } from './ai.repository';
import { GithubModule } from '../github/github.module';
import { JiraModule } from '../jira/jira.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    forwardRef(() => GithubModule),
    forwardRef(() => JiraModule),
    CacheModule.register({
      ttl: 300000, // 5 minutes cache
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiService],
})
export class AiModule {}
