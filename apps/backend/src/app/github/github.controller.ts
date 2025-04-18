import { Controller, Get, Param } from '@nestjs/common';
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
}
