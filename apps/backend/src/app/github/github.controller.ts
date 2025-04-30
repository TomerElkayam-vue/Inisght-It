import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { GithubService } from './github.service';
import { UserSpecificStats } from '@packages/github';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}
  @Get(':owner/:repo/project-stats')
  async getProjectStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string
  ): Promise<UserSpecificStats[]> {
    return this.githubService.getProjectStats(owner, repo);
  }

  @Get(':owner/:repo/users/:username/stats')
  async getUserStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('username') username: string
  ): Promise<UserSpecificStats> {
    return this.githubService.getUserStats(owner, repo, username);
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
