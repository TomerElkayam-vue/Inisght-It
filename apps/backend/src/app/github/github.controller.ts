import { Controller, Get, Param, Query, Res, Req, Body, Post } from '@nestjs/common';
import { GithubRemoteService } from './remote/github-remote.service';
import { SprintCommentsPerUser } from '@packages/github';

@Controller('github')
export class GithubController {
  constructor(
    private readonly GithubRemoteService: GithubRemoteService,
  ) {}
  //TODO: REPLACE WITH PATH WITH ONLY PROJECT ID
  @Get(':owner/:repo/project-stats')
  async getProjectStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('projectId') projectId: string,
    @Req() req: any
  ): Promise<SprintCommentsPerUser[]> {
    //@ts-ignore
    return this.GithubRemoteService.getProjectStats(
      owner,
      repo,
      req.projectCredentials,
      projectId
    );
  }

  @Get('/users/repos')
  async getUsersRepositories(
    @Query('projectId') projectId: string, 
    @Req() req: any) {
    return this.GithubRemoteService.getUsersRepositories(req.projectCredentials.ghoToken);
  }

  @Post('/update-github-project')
  async updateGithubProject(
    @Query('projectId') projectId: string, 
    @Body() githubProject: any,
    @Req() req: any) {
      console.log(githubProject);
      return;
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
