import { Controller, Get, Query } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('issues-count-by-sprint')
  getJiraIssuesCountBySprint(@Query('projectId') projectId: string) {
        console.log(projectId)
    return this.jiraService.countJiraIssuesBySprintPerUser();
  }

  @Get('sprints')
  getJiraSprints(@Query('projectId') projectId: string) {
    console.log(projectId)
    return this.jiraService.getJiraSprints();
  }
}
