import { Controller, Get, Query, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { QuestionDTO } from './dto/question.class';
import { GithubDataType } from '../github/enums/github-data-type';
import { JiraDataType } from '../jira/enums/jira-data-type.enum';

interface InsightsResponse {
  metrics: {
    pullRequests: number;
    codeReviews: number;
    averageCommentsUserGotPerPR: number;
    issuesCompleted: number;
    averageIssueTime: number;
    totalStoryPoints: number;
  };
  summary: string;
  recommendations: string[];
}

interface QuestionResponse {
  answer: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('worker-insights')
  async getWorkerInsights(
    @Query('projectId') projectId: string,
    @Query('employeeId') employeeId: string,
    @Query('isHebrew') isHebrew: boolean = true,
    @Req() req: any
  ): Promise<InsightsResponse> {
    try {
      if (!req.projectCredentials?.codeRepositoryCredentials) {
        throw new Error(
          'GitHub credentials not found. Please connect GitHub to the project.'
        );
      }

      if (!req.projectCredentials?.missionManagementCredentials) {
        throw new Error(
          'Jira credentials not found. Please connect Jira to the project.'
        );
      }

      // Get cached GitHub and Jira data
      const [githubData, jiraData] = await Promise.all([
        this.aiService.getGitHubData(projectId, req.projectCredentials),
        this.aiService.getJiraData(projectId, req.projectCredentials),
      ]);

      // Find worker data by employeeId and aggregate sprint data
      const findWorkerData = async (
        data: Record<string, Record<string, number>>
      ) => {
        // Get employee name from employee service
        const employee = await this.aiService.getEmployeeById(employeeId);
        if (!employee) {
          console.log('Employee not found for id:', employeeId);
          return null;
        }

        const workerEntry = Object.entries(data).find(
          ([name]) => name === employee.displayName
        );
        if (!workerEntry) {
          console.log('No data found for employee:', employee.displayName);
          return null;
        }

        // Sum up all sprint values
        return Object.values(workerEntry[1]).reduce(
          (sum, value) => sum + (value || 0),
          0
        );
      };

      const findWorkerDataObj = async (
        data: Record<string, Record<string, any>>,
        field: string
      ) => {
        // Get employee name from employee service
        const employee = await this.aiService.getEmployeeById(employeeId);
        if (!employee) {
          console.log('Employee not found for id:', employeeId);
          return null;
        }

        const workerEntry = Object.entries(data).find(
          ([name]) => name === employee.displayName
        );
        if (!workerEntry) {
          console.log('No data found for employee:', employee.displayName);
          return null;
        }

        // Sum up all sprint values
        return Object.values(workerEntry[1]).reduce(
          (sum, value) => sum + (value[field] || 0),
          0
        );
      };
      // Aggregate GitHub metrics across all sprints
      const githubMetrics = {
        pullRequests:
          (await findWorkerData(
            githubData[GithubDataType.PR] as unknown as Record<
              string,
              Record<string, number>
            >
          )) || 0,
        commits:
          (await findWorkerData(
            githubData[GithubDataType.COMMITS] as unknown as Record<
              string,
              Record<string, number>
            >
          )) || 0,
        comments:
          (await findWorkerData(
            githubData[GithubDataType.COMMENTS] as unknown as Record<
              string,
              Record<string, number>
            >
          )) || 0,
        fileChanges: {
          deletions:
            (await findWorkerDataObj(
              githubData[GithubDataType.COMMENTS] as unknown as Record<
                string,
                Record<string, number>
              >,
              'deletions'
            )) || 0,
          additions:
            (await findWorkerDataObj(
              githubData[GithubDataType.COMMENTS] as unknown as Record<
                string,
                Record<string, number>
              >,
              'additions'
            )) || 0,
        },
      };

      // Calculate metrics
      const metrics = {
        // GitHub metrics
        pullRequests: githubMetrics.pullRequests,
        codeReviews: githubMetrics.pullRequests, // Assuming each PR is a code review
        averageCommentsUserGotPerPR:
          githubMetrics.comments / (githubMetrics.pullRequests || 1),
        commits: githubMetrics.commits,
        fileChanges: githubMetrics.fileChanges,
        comments: githubMetrics.comments,

        // Jira metrics
        issuesCompleted:
          (await findWorkerData(
            jiraData[JiraDataType.ISSUES] as unknown as Record<
              string,
              Record<string, number>
            >
          )) || 0,

        averageIssueTime:
          (await findWorkerData(
            jiraData[JiraDataType.ISSUES] as unknown as Record<
              string,
              Record<string, number>
            >
          )) || 0,
        totalStoryPoints:
          (await findWorkerData(
            jiraData[JiraDataType.STORY_POINTS] as unknown as Record<
              string,
              Record<string, number>
            >
          )) || 0,
        issueTypes: {
          Bug:
            (await findWorkerDataObj(
              jiraData[JiraDataType.ISSUE_TYPE] as unknown as Record<
                string,
                Record<string, number>
              >,
              'Bug'
            )) || 0,
          Task:
            (await findWorkerDataObj(
              jiraData[JiraDataType.ISSUE_TYPE] as unknown as Record<
                string,
                Record<string, number>
              >,
              'Task'
            )) || 0,
        },
      };

      // Get AI insights
      const [summary, recommendations] = await Promise.all([
        this.aiService.getWorkerSummary(metrics),
        this.aiService.getAiRecoomendation(metrics),
      ]);

      return {
        metrics,
        summary,
        recommendations: [recommendations], // Convert single recommendation to array
      };
    } catch (error) {
      console.error('Error getting worker insights:', error);
      throw error;
    }
  }

  @Get('team-insights')
  async getTeamInsights(
    @Query('projectId') projectId: string,
    @Query('employeeIds') employeeIds: string,
    @Query('isHebrew') isHebrew: boolean = true,
    @Req() req: any
  ): Promise<InsightsResponse> {
    try {
      if (!req.projectCredentials?.codeRepositoryCredentials) {
        throw new Error(
          'GitHub credentials not found. Please connect GitHub to the project.'
        );
      }

      if (!req.projectCredentials?.missionManagementCredentials) {
        throw new Error(
          'Jira credentials not found. Please connect Jira to the project.'
        );
      }

      // Get cached GitHub and Jira data
      const [githubData, jiraData] = await Promise.all([
        this.aiService.getGitHubData(projectId, req.projectCredentials),
        this.aiService.getJiraData(projectId, req.projectCredentials),
      ]);

      // Filter data for specific employees if employeeIds is provided
      const targetEmployeeIds = employeeIds ? employeeIds.split(',') : [];
      const filteredGithubData =
        targetEmployeeIds.length > 0
          ? Object.entries(githubData).filter(([_, data]: [string, any]) =>
              targetEmployeeIds.includes(data.employeeId)
            )
          : Object.entries(githubData);

      // Calculate team metrics by aggregating individual metrics
      const teamMetrics = filteredGithubData.reduce(
        (acc: any, [_, workerData]: [string, any]) => {
          const jiraUserData =
            jiraData[JiraDataType.ISSUES]?.[workerData.name] || {};
          const storyPointsData =
            jiraData[JiraDataType.STORY_POINTS]?.[workerData.name] || {};

          return {
            pullRequests: (acc.pullRequests || 0) + (workerData.total || 0),
            codeReviews: (acc.codeReviews || 0) + (workerData.reviews || 0),
            averageCommentsUserGotPerPR:
              (acc.averageCommentsUserGotPerPR || 0) +
              (workerData.averageComments || 0),
            issuesCompleted:
              (acc.issuesCompleted || 0) + (jiraUserData.completed || 0),
            averageIssueTime:
              (acc.averageIssueTime || 0) + (jiraUserData.averageTime || 0),
            totalStoryPoints:
              (acc.totalStoryPoints || 0) + (storyPointsData.storyPoints || 0),
          };
        },
        {}
      );

      // Calculate averages
      const workerCount = filteredGithubData.length;
      teamMetrics.averageCommentsUserGotPerPR /= workerCount;
      teamMetrics.averageIssueTime /= workerCount;

      // Get AI insights
      const [summary, recommendations] = await Promise.all([
        this.aiService.getTeamSummary(teamMetrics),
        this.aiService.getTeamRecommendation(teamMetrics),
      ]);

      return {
        metrics: teamMetrics,
        summary,
        recommendations: [recommendations], // Convert single recommendation to array
      };
    } catch (error) {
      console.error('Error getting team insights:', error);
      throw error;
    }
  }

  @Get('question')
  @ApiOperation({ summary: 'Get AI recommendation' })
  @ApiBody({ type: QuestionDTO })
  async getQuestionAnswer(
    @Query() question: string,
    @Query('projectId') projectId: string,
    @Query('employeeId') employeeId: string,
    @Query('type') type: 'worker' | 'team',
    @Req() req: any
  ): Promise<QuestionResponse> {
    try {
      if (!req.projectCredentials?.codeRepositoryCredentials) {
        throw new Error(
          'GitHub credentials not found. Please connect GitHub to the project.'
        );
      }

      if (!req.projectCredentials?.missionManagementCredentials) {
        throw new Error(
          'Jira credentials not found. Please connect Jira to the project.'
        );
      }

      // Get metrics based on type
      let data;
      if (type === 'worker') {
        const response = await this.getWorkerInsights(
          projectId,
          employeeId,
          true,
          req
        );
        data = response.metrics;
      } else {
        const response = await this.getTeamInsights(
          projectId,
          '', // Empty string for userIds when getting team metrics
          true,
          req
        );
        data = response.metrics;
      }
      // Get AI answer
      const answer = await this.aiService.getQuestionAnswer({
        question,
        data,
        type,
      });

      return { answer };
    } catch (error) {
      console.error('Error getting question answer:', error);
      throw error;
    }
  }
}
