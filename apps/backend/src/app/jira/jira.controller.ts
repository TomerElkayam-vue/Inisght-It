import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { JiraService } from './jira.service';
import { JiraDataType } from './enums/jira-data-type.enum';
import { JiraAvgDataType } from './enums/jira-avg-data-type.enum';

@Controller("jira")
export class JiraController {
  private clientEndpoint: string;

  constructor(private readonly jiraService: JiraService) {
    this.clientEndpoint =
      process.env.CLIENT_ENDPOINT || "http://localhost:4200";
  }

  @Get("stats/:statType")
  getJiraIssuesCountBySprint(
    @Param("statType") statType: JiraDataType,
    @Query("projectId") projectId: string,
    @Query("teamStats") teamStats: boolean = false,
    @Req() req: any
  ) {
    if (req.projectCredentials?.missionManagementCredentials?.id) {
      if (teamStats) {
        return this.jiraService.countJiraStatsPerSprint(
          req.projectCredentials?.missionManagementCredentials,
          statType,
          projectId
        );
      } else {
        return this.jiraService.countJiraStatsPerUser(
          req.projectCredentials?.missionManagementCredentials,
          statType,
          projectId
        );
      }
    }
    return [];
  }

  @Get('issues')
  getJiraIssues(@Query('projectId') projectId: string, @Req() req: any) {
    if (req.projectCredentials?.missionManagementCredentials?.id) {
      return this.jiraService.getJiraRawIssues(
        req.projectCredentials?.missionManagementCredentials,
        projectId
      );
    } else {
      return [];
    }
  }

  @Get('issues-with-merge-requests/:sprintId')
  getJiraIssuesWithMergeRequests(
    @Query('projectId') projectId: string,
    @Param('sprintId', ParseIntPipe) sprintId: number,
    @Req() req: any
  ) {
    if (req.projectCredentials?.missionManagementCredentials) {
      return this.jiraService.getJiraIssuesWithMergeReqests(
        req.projectCredentials,
        projectId,
        sprintId
      );
    } else {
      return [];
    }
  }

  @Get('issues/changelog/:id')
  getJiraIssueChangelog(
    @Param('id') issueId: string,
    @Query('projectId') projectId: string,
    @Req() req: any
  ) {
    if (req.projectCredentials?.missionManagementCredentials?.id) {
      return this.jiraService.getJiraIssueChangelog(
        issueId,
        req.projectCredentials?.missionManagementCredentials,
        projectId
      );
    } else {
      return [];
    }
  }
  
  @Get('avg-stats/:avgDataType')
  getAvgJiraIsuue(
    @Query('projectId') projectId: string,
    @Param('avgDataType') avgDataType: JiraAvgDataType,
    @Req() req: any
  ) {
    if (req.projectCredentials?.missionManagementCredentials?.id)
      return this.jiraService.avgJiraIssuesPerSprint(
        req.projectCredentials?.missionManagementCredentials,
        avgDataType,
        projectId
      );

    return 0;
  }

  @Get('sprints')
  getJiraSprints(@Query('projectId') projectId: string, @Req() req: any) {
    if (req.projectCredentials?.missionManagementCredentials?.id) {
      return this.jiraService.getJiraSprints(
        req.projectCredentials?.missionManagementCredentials,
        projectId
      );
    } else {
      return [];
    }
  }

  @Get("/callback")
  async activateJiraCallback(
    @Query("projectId") projectId: string,
    @Query("code") code: string,
    @Res() res: any
  ) {
    await this.jiraService.getJiraToken(code as string, projectId);
    return res.redirect(
      `${this.clientEndpoint}/project-management?jira-successs=${true}`
    );
  }

  @Get("/projects")
  async getProjects(@Query("projectId") projectId: string, @Req() req: any) {
    return this.jiraService.getJiraProjects(
      req.projectCredentials?.missionManagementCredentials,
      projectId
    );
  }

  @Post("/update-jira-project")
  async updateJiraProject(
    @Query("projectId") projectId: string,
    @Body() jiraProject: { projectName: string; projectId: string }
  ) {
    return this.jiraService.updateJiraProjectOnProject(projectId, jiraProject);
  }
}
