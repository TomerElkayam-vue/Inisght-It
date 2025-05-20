import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import { GithubService } from './github.service';
import { SprintCommentsPerUser } from '@packages/github';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}
  @Get(':owner/:repo/project-stats')
  async getProjectStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('projectId') projectId: string,
    @Req() req: any
  ): Promise<SprintCommentsPerUser[]> {
    // console.log('Project Stats Route - Credentials:');
    // console.log(
    //   'missionManagementCredentials:',
    //   req.projectCredentials?.missionManagementCredentials
    // );
    // console.log(
    //   'codeRepositoryCredentials:',
    //   req.projectCredentials?.codeRepositoryCredentials
    // );
    return this.githubService.getProjectStats(
      owner,
      repo,
      req.projectCredentials
    );
  }

  // @Get(':owner/:repo/users/:username/prs')
  // async getUserPullRequests(
  //   @Param('owner') owner: string,
  //   @Param('repo') repo: string,
  //   @Param('username') username: string,
  //   @Query('from') from: string,
  //   @Query('to') to: string,
  //   @Req() req: any
  // ): Promise<any[]> {
  //   console.log('User Pull Requests Route - Credentials:');
  //   console.log('missionManagementCredentials:', req.projectCredentials?.missionManagementCredentials);
  //   console.log('codeRepositoryCredentials:', req.projectCredentials?.codeRepositoryCredentials);
  //   return this.githubService.getUserPullRequests(
  //     owner,
  //     repo,
  //     from,
  //     to,
  //     username
  //   );
  // }

  @Get('/callback')
  async githubCallback(
    // This is a type and not a string because the it's a redirect from github, causing the parameter to be sent as an object
    @Query('projectId') projectId: string,
    @Query('code') code: string,
    @Res() res: any,
    @Req() req: any
  ) {
    console.log('GitHub Callback Route - Credentials:');
    console.log(
      'missionManagementCredentials:',
      req.projectCredentials?.missionManagementCredentials
    );
    console.log(
      'codeRepositoryCredentials:',
      req.projectCredentials?.codeRepositoryCredentials
    );
    const token = await this.githubService.getUserGithubToken(code, projectId);

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/github-success?token=${token}`);
  }
}
