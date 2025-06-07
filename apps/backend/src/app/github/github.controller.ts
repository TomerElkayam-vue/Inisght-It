import { Controller, Get, Query, Res, Req, Body, Post, Param } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubDataType } from './enums/github-data-type';
import { GithubAvgDataType } from './enums/github-data-type copy';

@Controller('github')
export class GithubController {
  constructor(
    private readonly GithubService: GithubService,
  ) {}
  @Get('/stats/:statType')
  async getProjectStats(
    @Query('projectId') projectId: string, 
    @Query('teamStats') teamStats: boolean = false,
    @Param('statType') statType: GithubDataType,
    @Req() req: any) {
      if (teamStats)
        return this.GithubService.getProjectStatsBySprint(req.projectCredentials, statType, projectId);
      else
      return this.GithubService.getProjectStatsByUser(req.projectCredentials, statType, projectId);
  }

  @Get('/avg-stats/:avgDataType')
  async getGithubAvgStats(
    @Query('projectId') projectId: string, 
    @Param('avgDataType') avgDataType: GithubAvgDataType,
    @Req() req: any) {
      return this.GithubService.getAvgStatsBySprint(req.projectCredentials, avgDataType, projectId);
  }

  // for Tommer
  @Get('/pull-requests/')
  async getProjectPullsRequests(
    @Query('projectId') projectId: string, 
    @Query('startDate') startDate: string, 
    @Query('endDate') endDate: string, 
    @Req() req: any) {
      const {owner, name, token} = req.projectCredentials.codeRepositoryCredentials;
    return this.GithubService.getProjectPullRequests(owner, name, token, startDate, endDate);
  }

  @Get('/users/repos')
  async getUsersRepositories(
    @Query('projectId') projectId: string, 
    @Req() req: any) {
    return this.GithubService.getUsersRepositories(req.projectCredentials.codeRepositoryCredentials.token);
  }

  @Post('/update-github-project')
  async updateGithubProject(
    @Query('projectId') projectId: string, 
    @Body() githubProject: {id: string; name: string; owner: string;},
    @Req() req: any) {
      return this.GithubService.updateGithubProjectOnProject(projectId, githubProject);
  }

  @Get('/callback')
  async githubCallback(
    // This is a type and not a string because the it's a redirect from github, causing the parameter to be sent as an object
    @Query('projectId') projectId: string,
    @Query('code') code: string,
    @Res() res: any,
    @Req() req: any
  ) {
    const token = await this.GithubService.getUserGithubToken(
      code,
      projectId
    );

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/project-management?github-successs=${true}&token=${token}`);
  }
}
