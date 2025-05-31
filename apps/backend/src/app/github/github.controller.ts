import { Controller, Get, Query, Res, Req, Body, Post, Param } from '@nestjs/common';
import { GithubRemoteService } from './remote/github-remote.service';
import { SprintCommentsPerUser } from '@packages/github';
import { GithubDataType } from './enums/github-data-type.enum';

@Controller('github')
export class GithubController {
  constructor(
    private readonly GithubRemoteService: GithubRemoteService,
  ) {}
  @Get('/project-stats')
  async getProjectStats(
    @Query('projectId') projectId: string,
    @Req() req: any
  ): Promise<SprintCommentsPerUser[]> {
    return this.GithubRemoteService.getProjectStats(
      req.projectCredentials,
      projectId
    );
  }

  @Get('stats/:statType')
  getJiraIssuesCountBySprint(
    @Param('statType') statType: GithubDataType,
    @Query('projectId') projectId: string,
    @Query('teamStats') teamStats: boolean = false,
    @Req() req: any
  ) {
    if (req.projectCredentials?.codeRepositoryCredentials?.id) {
      if (teamStats) {
        // return this.jiraService.countJiraStatsPerSprint(
        //   req.projectCredentials?.missionManagementCredentials,
        //   statType,
        //   projectId
        // );
      } else {
        // return this.jiraService.countJiraStatsPerUser(
        //   req.projectCredentials?.missionManagementCredentials,
        //   statType,
        //   projectId
        // );
      }
    }
    return [];
  }

  @Get('/users/repos')
  async getUsersRepositories(
    @Query('projectId') projectId: string, 
    @Req() req: any) {
    return this.GithubRemoteService.getUsersRepositories(req.projectCredentials.codeRepositoryCredentials.token);
  }

  @Post('/update-github-project')
  async updateGithubProject(
    @Query('projectId') projectId: string, 
    @Body() githubProject: {id: string; name: string; owner: string;},
    @Req() req: any) {
      return this.GithubRemoteService.updateGithubProjectOnProject(projectId, githubProject);
  }

  @Get('/callback')
  async githubCallback(
    // This is a type and not a string because the it's a redirect from github, causing the parameter to be sent as an object
    @Query('projectId') projectId: string,
    @Query('code') code: string,
    @Res() res: any,
    @Req() req: any
  ) {
    const token = await this.GithubRemoteService.getUserGithubToken(
      code,
      projectId
    );

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/project-management?github-successs=${true}&token=${token}`);
  }
}
