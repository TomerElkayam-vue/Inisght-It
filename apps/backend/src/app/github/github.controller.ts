import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { GitHubService } from './github.service';

@Controller('github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('all-pull-requests')
  async getAllPullRequests(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('state') state?: 'all' | 'open' | 'closed',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('per_page', new DefaultValuePipe(30), ParseIntPipe) per_page?: number,
  ) {
    return this.githubService.getAllPullRequests(owner, repo, state, page, per_page);
  }

  @Get('pull-requests')
  async getPullRequestsByUser(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('username') username: string,
  ) {
    return this.githubService.getPullRequestsByUser(owner, repo, username);
  }

  @Get('repo-stats')
  async getRepositoryStats(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
  ) {
    return this.githubService.getRepositoryStats(owner, repo);
  }
} 