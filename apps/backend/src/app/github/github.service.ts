import { Injectable } from '@nestjs/common';
import { GithubRepository } from './github.repository';
import {
  GitHubComment,
  UserSpecificStats,
  RepositoryContributor,
} from '@packages/github';

@Injectable()
export class GithubService {
  constructor(private readonly githubRepository: GithubRepository) {}

  async getPullRequestComments(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<GitHubComment[]> {
    return this.githubRepository.getPullRequestComments(owner, repo, prNumber);
  }

  async getProjectStats(
    owner: string,
    repo: string
  ): Promise<UserSpecificStats[]> {
    const users = await this.getRepositoryContributors(owner, repo);
    return await Promise.all(
      users.map((user) => this.getUserStats(owner, repo, user.login))
    );
  }

  async getUserStats(
    owner: string,
    repo: string,
    username: string
  ): Promise<UserSpecificStats> {
    return this.githubRepository.getUserStats(owner, repo, username);
  }

  async getRepositoryContributors(
    owner: string,
    repo: string
  ): Promise<RepositoryContributor[]> {
    return this.githubRepository.getRepositoryContributors(owner, repo);
  }
}
