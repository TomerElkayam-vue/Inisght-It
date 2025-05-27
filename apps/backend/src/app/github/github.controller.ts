import { Controller, Get, Query, Res, Req, Body, Post } from '@nestjs/common';
import { GithubRemoteService } from './remote/github-remote.service';
import { GithubService } from './db/github.service';
import { SprintCommentsPerUser } from '@packages/github';

@Controller('github')
export class GithubController {
  constructor(
    private readonly GithubRemoteService: GithubRemoteService,
    private readonly GithubService: GithubService,
  ) {}
  //TODO: REPLACE WITH PATH WITH ONLY PROJECT ID
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
    const token = await this.GithubRemoteService.getUserGithubToken(
      code,
      projectId
    );

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/project-management?github-successs=${true}&token=${token}`);
  }
}
