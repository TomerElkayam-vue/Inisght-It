import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GithubRepository } from './github.repository';
import { 
  GitHubPullRequest, 
  GitHubReview, 
  GitHubComment,
  ProjectCommentsStats,
  UserSpecificStats
} from './types/github.types';

@Injectable()
export class GithubService {
  private readonly owner: string;
  private readonly repo: string;

  constructor(
    private readonly githubRepository: GithubRepository,
    private readonly configService: ConfigService,
  ) {
    this.owner = this.configService.get<string>('github.owner') || '';
    this.repo = this.configService.get<string>('github.repo') || '';
  }

  async getPullRequests(state: 'open' | 'closed' | 'all' = 'all'): Promise<GitHubPullRequest[]> {
    return this.githubRepository.getPullRequests(this.owner, this.repo, state);
  }

  async getPullRequestReviews(prNumber: number): Promise<GitHubReview[]> {
    return this.githubRepository.getPullRequestReviews(this.owner, this.repo, prNumber);
  }

  async getPullRequestComments(prNumber: number): Promise<GitHubComment[]> {
    return this.githubRepository.getPullRequestComments(this.owner, this.repo, prNumber);
  }

  async getProjectStats(): Promise<ProjectCommentsStats> {
    return this.githubRepository.getProjectCommentsStats(this.owner, this.repo);
  }

  async getUserStats(username: string): Promise<UserSpecificStats> {
    return this.githubRepository.getUserStats(this.owner, this.repo, username);
  }
} 