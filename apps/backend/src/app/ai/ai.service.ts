import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { GithubService } from '../github/github.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GithubDataType } from '../github/enums/github-data-type';
import { JiraDataType } from '../jira/enums/jira-data-type.enum';
import { JiraService } from '../jira/jira.service';
import { EmployeeService } from '../employee/employee.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    @Inject(forwardRef(() => GithubService))
    private githubService: GithubService,
    @Inject(forwardRef(() => JiraService))
    private jiraService: JiraService,
    @Inject(forwardRef(() => EmployeeService))
    private employeeService: EmployeeService,
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
      const githubDataTypes = Object.values(GithubDataType);

      const githubDataPromises = githubDataTypes.map((dataType) => {
        return this.githubService
          .getProjectStatsByUser(
            {
              codeRepositoryCredentials: credentials.codeRepositoryCredentials,
              missionManagementCredentials:
                credentials.missionManagementCredentials,
            },
            dataType,
            projectId
          )
          .then((res) => {
            return res;
          })
          .catch((err) => {
            console.error(
              `[getGitHubData] Error for type=${dataType}`,
              err.message || err
            );
            // return fallback instead of throwing
            return {
              [dataType]: {
                total: 0,
                userId: 'unknown',
                reviews: 0,
                averageComments: 0,
                note: 'missing data',
              },
            };
          });
      });

      const githubDataResults = await Promise.all(githubDataPromises);

      const reduced = githubDataResults.reduce((acc, curr, index) => {
        const dataType = githubDataTypes[index];

        acc[dataType] = curr as Record<
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

      const blindSpotsInCode = await this.githubService.getBlindsSpotsInCode(
        credentials.codeRepositoryCredentials
      );

      const serverClientDistribution =
        await this.githubService.getServerClientDistribution(
          credentials.codeRepositoryCredentials
        );

      return { reduced, blindSpotsInCode, serverClientDistribution };
    });
  }

  async getJiraData(projectId: string, credentials: any) {
    const cacheKey = `jira_data_${projectId}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const dataTypes = Object.values(JiraDataType);

      const jiraDataPromises = dataTypes.map((dataType) => {
        return this.jiraService
          .countJiraStatsPerUser(
            credentials.missionManagementCredentials,
            dataType,
            projectId
          )
          .catch((err: any) => {
            console.error(
              `[getJiraData] Error for dataType=${dataType}`,
              err.message || err
            );
            return { error: true, message: err.message || String(err) }; // fallback
          });
      });

      const jiraDataResults = await Promise.all(jiraDataPromises);

      const reduced = jiraDataResults.reduce((acc, curr, index) => {
        const dataType = dataTypes[index];

        acc[dataType] = curr;
        return acc;
      }, {} as Record<JiraDataType, any>);

      return reduced;
    });
  }

  async getAiRecoomendation(info: any) {
    return this.aiRepository.getWorkerRecommendation(info);
  }

  async getTeamRecommendation(info: any) {
    return this.aiRepository.getTeamRecommendation(info);
  }

  async getWorkerSummary(info: any) {
    return this.aiRepository.getWorkerSummary(info);
  }

  async getTeamSummary(info: any) {
    return this.aiRepository.getTeamSummary(info);
  }

  async getWorkerQuestionAnswer(question: any, info: any) {
    return this.aiRepository.getWorkerQuestionAnswer(question, info);
  }

  async getTeamQuestionAnswer(question: any, info: any) {
    return this.aiRepository.getTeamQuestionAnswer(question, info);
  }

  async getArrayMatchingRecord(
    firstArray: string[],
    secondArray: string[]
  ): Promise<Record<string, string> | undefined> {
    return this.aiRepository.getArrayMatchingRecord(firstArray, secondArray);
  }

  async getMergeRequestByIssue(issues: any[], codeRepositoryCredentials: any) {
    const mergeRequests = await this.githubService.getAllPullRequests(
      codeRepositoryCredentials
    );
    return this.aiRepository.getRelatedMergeRequestTitle(mergeRequests, issues);
  }

  async getEmployeeById(employeeId: string) {
    return this.employeeService.findEmployeeById(employeeId);
  }
}
