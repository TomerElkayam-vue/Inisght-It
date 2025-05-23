import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('issues-count-by-sprint')
  getJiraIssuesCountBySprint(
    @Query('projectId') projectId: string,
    @Req() req: any
  ) {
    if (req.projectCredentials?.missionManagementCredentials?.id) {
      return this.jiraService.countJiraIssuesBySprintPerUser(
        req.projectCredentials?.missionManagementCredentials
      );
    }
    return [];
  }

  @Get('sprints')
  getJiraSprints(@Query('projectId') projectId: string, @Req() req: any) {
    if (req.projectCredentials?.missionManagementCredentials?.id) {
      return this.jiraService.getJiraSprints(
        req.projectCredentials?.missionManagementCredentials
      );
    } else {
      return [];
    }
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

  @Get('/projects')
  async getProjects(@Query('projectId') projectId: string, @Req() req: any) {
    return this.jiraService.getJiraProjects(
      req.projectCredentials?.missionManagementCredentials
    );
  }

  @Post('/update-jira-project')
  async updateJiraProject(
    @Query('projectId') projectId: string,
    @Body() jiraProject: { projectName: string; projectId: string }
  ) {
    return this.jiraService.updateJiraProjectOnProject(projectId, jiraProject);
  }
}
