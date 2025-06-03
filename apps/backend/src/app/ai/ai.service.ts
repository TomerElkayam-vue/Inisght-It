import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { UserInfo } from './types/user-info.type';
import { GithubService } from '../github/github.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    private githubService: GithubService
  ) {}

  async getAiRecoomendation(userInfo: UserInfo) {
    return this.aiRepository.getWorkerRecommendation(userInfo);
  }

  async getMergeRequestByIssue(issues: any[], codeRepositoryCredentials: any) {
    const mergeRequests = await this.githubService.getAllPullRequests(
      codeRepositoryCredentials
    );
    return this.aiRepository.getRelatedMergeRequestTitle(mergeRequests, issues);
  }
}
