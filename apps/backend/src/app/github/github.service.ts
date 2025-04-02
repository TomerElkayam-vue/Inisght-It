import { Injectable } from '@nestjs/common';
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
  constructor(private readonly githubRepository: GithubRepository) {}

  async getPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'all'): Promise<GitHubPullRequest[]> {
    return this.githubRepository.getPullRequests(owner, repo, state);
  }

  async getPullRequestReviews(owner: string, repo: string, prNumber: number): Promise<GitHubReview[]> {
    return this.githubRepository.getPullRequestReviews(owner, repo, prNumber);
  }

  async getPullRequestComments(owner: string, repo: string, prNumber: number): Promise<GitHubComment[]> {
    return this.githubRepository.getPullRequestComments(owner, repo, prNumber);
  }

  async getProjectStats(owner: string, repo: string): Promise<ProjectCommentsStats> {
    return this.githubRepository.getProjectCommentsStats(owner, repo);
  }

  async getUserStats(owner: string, repo: string, username: string): Promise<UserSpecificStats> {
    return this.githubRepository.getUserStats(owner, repo, username);
  }
} 