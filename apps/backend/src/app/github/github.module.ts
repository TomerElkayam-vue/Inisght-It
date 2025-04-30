import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';
import { GithubRepository } from './github.repository';
import { githubConfig } from '../../config/github-config';
import { ProjectsModule } from '../projects/project.module';

@Module({
  imports: [ProjectsModule, ConfigModule.forFeature(githubConfig), HttpModule],
  controllers: [GithubController],
  providers: [GithubService, GithubRepository],
  exports: [GithubService],
})
export class GithubModule {}
