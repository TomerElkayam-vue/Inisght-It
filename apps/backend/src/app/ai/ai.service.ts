import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { UserInfo } from './types/user-info.type';
import { QuestionDTO } from './dto/question.class';
import { GithubService } from '../github/github.service';

@Injectable()
export class AiService {
  constructor(
    private readonly aiRepository: AiRepository,
    @Inject(forwardRef(() => GithubService))
    private githubService: GithubService
  ) {}

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
