import { Injectable } from '@nestjs/common';
import { GithubRepository } from './github.repository';
import { ProjectsSerivce } from '../projects/project.service';
import {
  GitHubComment,
  UserSpecificStats,
  RepositoryContributor,
  SprintCommentsPerUser,
} from '@packages/github';
import { JiraService } from '../jira/jira.service';

@Injectable()
export class GithubService {
  constructor(
    private readonly githubRepository: GithubRepository,
    private projectsService: ProjectsSerivce,
    private readonly jiraService: JiraService
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
  ): Promise<SprintCommentsPerUser[]> {
    const sprints = await this.jiraService.getJiraSprints();
    const users = await this.getRepositoryContributors(owner, repo);

    const sprintStats = await Promise.all(
      sprints.map(async (sprint) => {
        const userStats = await Promise.all(
          users.map((user) =>
            this.getUserStatsPerSprint(
              owner,
              repo,
              user.login,
              sprint.startDate,
              sprint.endDate
            )
          )
        );

        return {
          sprintId: sprint.id,
          sprintName: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          userStats,
        };
      })
    );

    return sprintStats;
  }

  async getUserStatsPerSprint(
    owner: string,
    repo: string,
    username: string,
    startDate: string | null,
    endDate: string | null
  ): Promise<UserSpecificStats> {
    // call your GitHub query function for PRs within that range
    const userSpecificStats =
      await this.githubRepository.getCommentsRecivedForUser(
        owner,
        repo,
        startDate,
        endDate,
        username
      );

    // calculate stats from PRs
    return userSpecificStats;
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
    return this.githubRepository.getOpenPullRequestsBetweenDates(
      owner,
      repo,
      startDate,
      endDate,
      username
    );
  }
}
