import { Controller, Get, Param, Req } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('issues-count-by-sprint')
  getJiraIssuesCountBySprint(@Req() req: Request, @Param('projectId') projectId: string) {
    return this.jiraService.countJiraIssuesBySprintPerUser();
  }

  @Get('sprints')
  getJiraSprints(@Req() req: Request, @Param('projectId') projectId: string) {
    return this.jiraService.getJiraSprints();
  }
}
