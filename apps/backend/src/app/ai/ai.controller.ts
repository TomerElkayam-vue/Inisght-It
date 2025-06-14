import { Controller, Get, Body, Query, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { QuestionDTO } from './dto/question.class';
import { GithubDataType } from '../github/enums/github-data-type';
import { JiraDataType } from '../jira/enums/jira-data-type.enum';

interface InsightsResponse {
  metrics: {
    pullRequests: number;
    codeReviews: number;
    averageCommentsPerPR: number;
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
    @Query('userId') userId: string,
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

      // Find worker data by userId and aggregate sprint data
      const findWorkerData = (data: Record<string, Record<string, number>>) => {
        const workerEntry = Object.entries(data).find(
          // TODO changeeee
          ([name]) => name === 'Tomer Elkayam'
        );
        if (!workerEntry) return null;

        // Sum up all sprint values
        return Object.values(workerEntry[1]).reduce(
          (sum, value) => sum + (value || 0),
          0
        );
      };

      // Aggregate GitHub metrics across all sprints
      const githubMetrics = {
        pullRequests:
          findWorkerData(
            githubData[GithubDataType.PR] as unknown as Record<
              string,
              Record<string, number>
            >
          ) || 0,
        commits:
          findWorkerData(
            githubData[GithubDataType.COMMITS] as unknown as Record<
              string,
              Record<string, number>
            >
          ) || 0,
        comments:
          findWorkerData(
            githubData[GithubDataType.COMMENTS] as unknown as Record<
              string,
              Record<string, number>
            >
          ) || 0,
        fileChanges: Object.entries(
          githubData[GithubDataType.FILE_CHANGES] || {}
        ).find(([name]) => name === userId)?.[1] || {
          additions: 0,
          deletions: 0,
        },
      };

      // Calculate metrics
      const metrics = {
        // GitHub metrics
        pullRequests: githubMetrics.pullRequests,
        codeReviews: githubMetrics.pullRequests, // Assuming each PR is a code review
        averageCommentsPerPR:
          githubMetrics.comments / (githubMetrics.pullRequests || 1),
        commits: githubMetrics.commits,
        fileChanges: githubMetrics.fileChanges,
        comments: githubMetrics.comments,

        // Jira metrics
        issuesCompleted:
          (jiraData[JiraDataType.ISSUES] as any)[userId]?.completed || 0,
        averageIssueTime:
          (jiraData[JiraDataType.ISSUES] as any)[userId]?.averageTime || 0,
        totalStoryPoints:
          (jiraData[JiraDataType.STORY_POINTS] as any)[userId]?.storyPoints ||
          0,
        issueStatus: (jiraData[JiraDataType.ISSUE_STATUS] as any)[userId] || {},
        issueTypes: (jiraData[JiraDataType.ISSUE_TYPE] as any)[userId] || {},
      };

      console.log('Calculated Metrics:', metrics);

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
    @Query('userIds') userIds: string,
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

      // Filter data for specific users if userIds is provided
      const targetUserIds = userIds ? userIds.split(',') : [];
      const filteredGithubData =
        targetUserIds.length > 0
          ? Object.entries(githubData).filter(([_, data]: [string, any]) =>
              targetUserIds.includes(data.userId)
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
            averageCommentsPerPR:
              (acc.averageCommentsPerPR || 0) +
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
      teamMetrics.averageCommentsPerPR /= workerCount;
      teamMetrics.averageIssueTime /= workerCount;

      console.log('Final Team Metrics:', teamMetrics);

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

  @Get('questions')
  @ApiOperation({ summary: 'Get AI recommendation' })
  @ApiBody({ type: QuestionDTO })
  async getQuestionAnswer(
    @Body() question: QuestionDTO,
    @Query('projectId') projectId: string,
    @Query('userId') userId: string,
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
      let metrics;
      if (type === 'worker') {
        const response = await this.getWorkerInsights(
          projectId,
          userId,
          true,
          req
        );
        metrics = response.metrics;
      } else {
        const response = await this.getTeamInsights(
          projectId,
          '', // Empty string for userIds when getting team metrics
          true,
          req
        );
        metrics = response.metrics;
      }

      const answer = await this.aiService.getQuestionAnswer({
        ...question,
        metrics,
        type,
      });
      return { answer };
    } catch (error) {
      console.error('Error getting question answer:', error);
      throw error;
    }
  }
}
