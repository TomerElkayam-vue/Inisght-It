import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GithubService } from './github.service';

@Controller('github')
@UseGuards(AuthGuard('jwt'))
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('pull-requests')
  async getPullRequests(
    @Query('state') state: 'open' | 'closed' | 'all' = 'all',
  ) {
    return this.githubService.getPullRequests(state);
  }

  @Get('pull-requests/:number/reviews')
  async getPullRequestReviews(@Param('number') prNumber: string) {
    return this.githubService.getPullRequestReviews(Number(prNumber));
  }

  @Get('pull-requests/:number/comments')
  async getPullRequestComments(@Param('number') prNumber: string) {
    return this.githubService.getPullRequestComments(Number(prNumber));
  }
} 