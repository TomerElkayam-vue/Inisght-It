import { Controller, Get, Param, Query } from '@nestjs/common';
import { GithubService } from './github.service';
import { 
  GitHubPullRequest, 
  GitHubReview, 
  GitHubComment,
  ProjectCommentsStats,
  UserSpecificStats
} from './types/github.types';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('pull-requests')
  async getPullRequests(
    @Query('state') state: 'open' | 'closed' | 'all' = 'all'
  ): Promise<GitHubPullRequest[]> {
    return this.githubService.getPullRequests(state);
  }

  @Get('project-stats')
  async getProjectStats(): Promise<ProjectCommentsStats> {
    return this.githubService.getProjectStats();
  }

  @Get('users/:username/stats')
  async getUserStats(@Param('username') username: string): Promise<UserSpecificStats> {
    return this.githubService.getUserStats(username);
  }

  @Get('pull-requests/:number/reviews')
  async getPullRequestReviews(
    @Param('number') prNumber: number
  ): Promise<GitHubReview[]> {
    return this.githubService.getPullRequestReviews(prNumber);
  }

  @Get('pull-requests/:number/comments')
  async getPullRequestComments(
    @Param('number') prNumber: number
  ): Promise<GitHubComment[]> {
    return this.githubService.getPullRequestComments(prNumber);
  }
} 