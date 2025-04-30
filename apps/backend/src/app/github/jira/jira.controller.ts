import { Controller, Get } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('issues-count')
  getJiraIssuesCount() {
    return this.jiraService.countJiraIssuesPerUser();
  }

  @Get('sprints')
  getJiraSprints() {
    return this.jiraService.getJiraSprints();
  }
}
