import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { UserInfo } from './types/user-info.type';
import { QuestionDTO } from './dto/question.class';
import { GithubService } from '../github/github.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GithubDataType } from '../github/enums/github-data-type';
import { JiraDataType } from '../jira/enums/jira-data-type.enum';
import { JiraService } from '../jira/jira.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    @Inject(forwardRef(() => GithubService))
    private githubService: GithubService,
    @Inject(forwardRef(() => JiraService))
    private jiraService: JiraService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private async getCachedOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      return cached;
    }
    const result = await fetchFn();
    await this.cacheManager.set(key, result);
    return result;
  }

  async getGitHubData(projectId: string, credentials: any) {
    const cacheKey = `github_data_${projectId}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const githubDataPromises = Object.values(GithubDataType).map((dataType) =>
        this.githubService.getProjectStatsByUser(
          {
            codeRepositoryCredentials: credentials.codeRepositoryCredentials,
            missionManagementCredentials:
              credentials.missionManagementCredentials,
          },
          dataType,
          projectId
        )
      );

      const githubDataResults = await Promise.all(githubDataPromises);
      return githubDataResults.reduce((acc, curr, index) => {
        const dataType = Object.values(GithubDataType)[index];
        acc[dataType] = curr as unknown as Record<
          string,
          {
            total: number;
            userId: string;
            reviews: number;
            averageComments: number;
          }
        >;
        return acc;
      }, {} as Record<GithubDataType, Record<string, { total: number; userId: string; reviews: number; averageComments: number }>>);
    });
  }

  async getJiraData(projectId: string, credentials: any) {
    const cacheKey = `jira_data_${projectId}`;
    return this.getCachedOrFetch(cacheKey, async () => {
      const jiraDataPromises = Object.values(JiraDataType).map((dataType) =>
        this.jiraService.countJiraStatsPerUser(
          credentials.missionManagementCredentials,
          dataType,
          projectId
        )
      );

      const jiraDataResults = await Promise.all(jiraDataPromises);
      return jiraDataResults.reduce((acc, curr, index) => {
        const dataType = Object.values(JiraDataType)[index];
        acc[dataType] = curr;
        return acc;
      }, {} as Record<JiraDataType, any>);
    });
  }

  async getAiRecoomendation(userInfo: UserInfo) {
    return this.aiRepository.getWorkerRecommendation(userInfo);
  }

  async getTeamRecommendation(userInfo: UserInfo) {
    return this.aiRepository.getTeamRecommendation(userInfo);
  }

  async getWorkerSummary(userInfo: UserInfo) {
    return this.aiRepository.getWorkerSummary(userInfo);
  }

  async getTeamSummary(userInfo: UserInfo) {
    return this.aiRepository.getTeamSummary(userInfo);
  }

  async getQuestionAnswer(question: QuestionDTO) {
    return this.aiRepository.getQuestionAnswer(question);
  }

  async getMergeRequestByIssue(issues: any[], codeRepositoryCredentials: any) {
    const mergeRequests = await this.githubService.getAllPullRequests(
      codeRepositoryCredentials
    );
    return this.aiRepository.getRelatedMergeRequestTitle(mergeRequests, issues);
  }
}
