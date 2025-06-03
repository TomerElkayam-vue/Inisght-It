import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRepository } from './ai.repository';
import { GithubModule } from '../github/github.module';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiService],
  imports: [GithubModule],
})
export class AiModule {}
