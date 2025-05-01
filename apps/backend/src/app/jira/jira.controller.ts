import { Controller, Get } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('issues-count-by-sprint')
  getJiraIssuesCountBySprint() {
    return this.jiraService.countJiraIssuesBySprintPerUser();
  }

  @Get('sprints')
  getJiraSprints() {
    return this.jiraService.getJiraSprints();
  }
}
