import { Controller, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';
import { 
  GitHubPullRequest, 
  GitHubReview, 
  GitHubComment,
  UserSpecificStats,
  RepositoryUser
} from './types/github.types';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get(':owner/:repo/pull-requests')
  async getPullRequests(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('state') state: 'open' | 'closed' | 'all' = 'all'
  ): Promise<GitHubPullRequest[]> {
    return this.githubService.getPullRequests(owner, repo, state);
  }

  @Get(':owner/:repo/project-stats')
  async getProjectStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string
  ): Promise<UserSpecificStats[]> {
    return this.githubService.getProjectStats(owner, repo);
  }

  @Get(':owner/:repo/users')
  async getRepositoryUsers(
    @Param('owner') owner: string,
    @Param('repo') repo: string
  ): Promise<RepositoryUser[]> {
    return this.githubService.getRepositoryUsers(owner, repo);
  }

  @Get(':owner/:repo/users/:username/stats')
  async getUserStats(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('username') username: string
  ): Promise<UserSpecificStats> {
    return this.githubService.getUserStats(owner, repo, username);
  }

  @Get(':owner/:repo/pull-requests/:number/reviews')
  async getPullRequestReviews(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') prNumber: number
  ): Promise<GitHubReview[]> {
    return this.githubService.getPullRequestReviews(owner, repo, prNumber);
  }

  @Get(':owner/:repo/pull-requests/:number/comments')
  async getPullRequestComments(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('number') prNumber: number
  ): Promise<GitHubComment[]> {
    return this.githubService.getPullRequestComments(owner, repo, prNumber);
  }
} 