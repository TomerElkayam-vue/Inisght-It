import { Controller, Get, Query, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiOperation } from '@nestjs/swagger';

interface InsightsResponse {
  summary: string;
  recommendations: string;
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

      const [githubData, jiraData] = await Promise.all([
        this.aiService.getGitHubData(projectId, req.projectCredentials),
        this.aiService.getJiraData(projectId, req.projectCredentials),
      ]);

      const employee = await this.aiService.getEmployeeById(employeeId);
      if (!employee) {
        console.log('Employee not found for id:', employeeId);
        throw new Error(`Employee with id ${employeeId} not found.`);
      }
      const data = {
        github: githubData,
        jira: jiraData,
        employee: {
          githubUsername: employee.githubUsername,
          name: employee.displayName,
          jiraUsername: employee.jiraUsername,
        },
      };

      const [summary, recommendations] = await Promise.all([
        this.aiService.getWorkerSummary(data),
        this.aiService.getAiRecoomendation(data),
      ]);

      return {
        summary,
        recommendations,
      };
    } catch (error) {
      console.error('Error getting worker insights:', error);
      throw error;
    }
  }

  @Get('team-insights')
  async getTeamInsights(
    @Query('projectId') projectId: string,
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

      const [githubData, jiraData] = await Promise.all([
        this.aiService.getGitHubData(projectId, req.projectCredentials),
        this.aiService.getJiraData(projectId, req.projectCredentials),
      ]);

      const data = {
        github: githubData,
        jira: jiraData,
      };

      const [summary, recommendations] = await Promise.all([
        this.aiService.getTeamSummary(data),
        this.aiService.getTeamRecommendation(data),
      ]);

      console.log('AI Insights in controller:', { summary, recommendations });

      return {
        summary,
        recommendations,
      };
    } catch (error) {
      // console.error('Error getting team insights:', error);
      throw error;
    }
  }

  @Get('question')
  @ApiOperation({ summary: 'Get AI recommendation' })
  async getQuestionAnswer(
    @Query('question') question: string,
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

      const [githubData, jiraData] = await Promise.all([
        this.aiService.getGitHubData(projectId, req.projectCredentials),
        this.aiService.getJiraData(projectId, req.projectCredentials),
      ]);

      const data: any = {
        github: githubData,
        jira: jiraData,
      };

      if (type === 'worker') {
        const employee = await this.aiService.getEmployeeById(employeeId);
        if (!employee) {
          console.log('Employee not found for id:', employeeId);
          throw new Error(`Employee with id ${employeeId} not found.`);
        }
        data.employee = {
          githubUsername: employee.githubUsername,
          name: employee.displayName,
          jiraUsername: employee.jiraUsername,
        };
      }

      const answer =
        type === 'worker'
          ? await this.aiService.getWorkerQuestionAnswer(question, data)
          : await this.aiService.getTeamQuestionAnswer(question, data);

      return { answer };
    } catch (error) {
      // console.error('Error getting question answer:', error);
      throw error;
    }
  }
}
