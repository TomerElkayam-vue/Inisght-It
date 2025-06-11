import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { UserInfo } from './types/user-info.type';
import { QuestionDTO } from './dto/question.class';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

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
}
