
import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
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

  @Get('/callback')
  async activateJiraCallback(
    @Query('projectId') projectId: string,
    @Query('code') code: string,
    @Res() res: any
  ) {
    await this.jiraService.getJiraToken(code as string, projectId);
    return res.redirect(
      `http://localhost:4200/project-management?jira-successs=${true}`
    );
  }

  @Get('/projects/:projectId')
  async getProjects(@Param('projectId') projectId: string) {
    return this.jiraService.getJiraProjects(projectId);
  }

  @Post('/update-jira-project/:projectId')
  async updateJiraProject(
    @Param('projectId') projectId: string,
    @Body() jiraProject: { projectName: string; projectId: string }
  ) {
    return this.jiraService.updateJiraProjectOnProject(projectId, jiraProject);
  }
}
