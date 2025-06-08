import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { UserInfo } from './types/user-info.type';

interface WorkerMetrics {
  github: {
    pullRequests: Record<string, any>;
    comments: Record<string, any>;
    commits: Record<string, any>;
    fileChanges: Record<string, any>;
  };
  jira: {
    issues: Record<string, any>;
    storyPoints: Record<string, any>;
    issueStatus: Record<string, any>;
    issueType: Record<string, any>;
  };
}

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async getAiRecoomendation(userInfo: UserInfo) {
    return this.aiRepository.getWorkerRecommendation(userInfo);
  }

  async generateResponse(
    metrics: WorkerMetrics,
    question: string
  ): Promise<string> {
    const prompt = `Based on the following worker metrics and question, provide a detailed response:

Metrics:
- GitHub Pull Requests: ${JSON.stringify(metrics.github.pullRequests)}
- GitHub Comments: ${JSON.stringify(metrics.github.comments)}
- GitHub Commits: ${JSON.stringify(metrics.github.commits)}
- GitHub File Changes: ${JSON.stringify(metrics.github.fileChanges)}
- Jira Issues: ${JSON.stringify(metrics.jira.issues)}
- Jira Story Points: ${JSON.stringify(metrics.jira.storyPoints)}
- Jira Issue Status: ${JSON.stringify(metrics.jira.issueStatus)}
- Jira Issue Type: ${JSON.stringify(metrics.jira.issueType)}

Question: ${question}

Please provide a detailed response that addresses the question while considering the worker's performance metrics.`;

    return this.aiRepository.generateResponse(prompt);
  }

  async generateInsights(metrics: WorkerMetrics): Promise<string> {
    const prompt = `Based on the following worker metrics, provide detailed insights and recommendations:

Metrics:
- GitHub Pull Requests: ${JSON.stringify(metrics.github.pullRequests)}
- GitHub Comments: ${JSON.stringify(metrics.github.comments)}
- GitHub Commits: ${JSON.stringify(metrics.github.commits)}
- GitHub File Changes: ${JSON.stringify(metrics.github.fileChanges)}
- Jira Issues: ${JSON.stringify(metrics.jira.issues)}
- Jira Story Points: ${JSON.stringify(metrics.jira.storyPoints)}
- Jira Issue Status: ${JSON.stringify(metrics.jira.issueStatus)}
- Jira Issue Type: ${JSON.stringify(metrics.jira.issueType)}

Please provide:
1. A summary of the worker's performance
2. Key strengths and areas for improvement
3. Specific recommendations for growth`;

    return this.aiRepository.generateResponse(prompt);
  }
}
