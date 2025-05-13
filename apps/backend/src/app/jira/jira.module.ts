import { Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { JiraRepository } from './jira.repository';
import { HttpModule } from '@nestjs/axios';
import { jiraConfig, JiraConfig } from '../../config/jira-config';
import { ProjectsModule } from '../projects/project.module';

@Module({
  controllers: [JiraController],
  providers: [JiraService, JiraRepository],
  imports: [
    ProjectsModule,
    HttpModule.registerAsync({
      useFactory: (config: JiraConfig) => {
        return {
          baseURL: config.jiraUrl,
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${config.email}:${config.apiToken}`
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        };
      },
      inject: [jiraConfig.KEY],
    }),
  ],
  exports: [JiraService],
})
export class JiraModule {}
