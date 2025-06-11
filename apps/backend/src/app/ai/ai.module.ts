import { forwardRef, Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRepository } from './ai.repository';
import { GithubModule } from '../github/github.module';
import { JiraModule } from '../jira/jira.module';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiService],
  imports: [forwardRef(() => GithubModule), forwardRef(() => JiraModule)],
})
export class AiModule {}
