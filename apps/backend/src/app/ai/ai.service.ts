import { Injectable } from '@nestjs/common';
import { AiRepository } from './ai.repository';
import { UserInfo } from './types/user-info.type';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async getAiRecoomendation(userInfo: UserInfo) {
    return this.aiRepository.getWorkerRecommendation(userInfo);
  }
}
