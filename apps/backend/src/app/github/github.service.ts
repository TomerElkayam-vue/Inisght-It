import { Injectable } from '@nestjs/common';
import { GithubRepository } from './github.repository';
import { ProjectsSerivce } from '../projects/project.service';
import {
  GitHubComment,
  UserSpecificStats,
  RepositoryContributor,
} from '@packages/github';

@Injectable()
export class GithubService {
  constructor(
    private readonly githubRepository: GithubRepository,
    private projectsService: ProjectsSerivce
  ) {}

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

  async getUserGithubToken(code: string, projectId: string) {
    const token = await this.githubRepository.getUserGithubToken(code);
    await this.projectsService.updateProject({
      where: { id: projectId },
      data: {
        codeRepositoryCredentials: { token },
      },
    });
    return token;
  }

  async getUserPullRequests(
    owner: string,
    repo: string,
    startDate: string,
    endDate: string,
    username: string
  ): Promise<RepositoryContributor[]> {
    return this.githubRepository.getOpenPullRequestsBetweenDates(owner, repo, startDate, endDate, username);
  }
}
