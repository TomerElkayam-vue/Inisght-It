import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { GithubService } from './github.service';
import { SprintCommentsPerUser } from '@packages/github';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}
  @Get(':owner/:repo/project-stats')
  async getProjectStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string
  ): Promise<SprintCommentsPerUser[]> {
    return this.githubService.getProjectStats(owner, repo);
  }

  @Get(':owner/:repo/users/:username/prs')
  async getUserPullRequests(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('username') username: string,
    @Query('from') from: string,
    @Query('to') to: string
  ): Promise<any[]> {
    return this.githubService.getUserPullRequests(
      owner,
      repo,
      from,
      to,
      username
    );
  }

  @Get('callback/:projectId')
  async githubCallback(
    // This is a type and not a string because the it's a redirect from github, causing the parameter to be sent as an object
    @Param() projectId: { projectId: string },
    @Query('code') code: string,
    @Res() res: any
  ) {
    const token = await this.githubService.getUserGithubToken(
      code,
      projectId.projectId
    );

    // For dev: pass token in URL (insecure for prod)
    return res.redirect(`http://localhost:4200/github-success?token=${token}`);
  }
}
