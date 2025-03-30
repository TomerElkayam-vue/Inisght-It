import { Inject, Injectable } from '@nestjs/common';
import { UserInfo } from './types/user-info.type';
import * as geminiConfig from '../../config/gemini-config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiRepository {
  constructor(
    @Inject(geminiConfig.geminiConfig.KEY)
    private readonly geminiConfigValues: geminiConfig.GeminiConfigType
  ) {}

  genAI = new GoogleGenerativeAI(this.geminiConfigValues.geminiKey ?? '');
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async getWorkerRecommendation(userInfo: UserInfo): Promise<string> {
    const promt = `Give your recommendation and summery about a worker that have done ${userInfo.amountOfUserStories} Suser stories, and ${userInfo.amountOfCommentsPerReview} comments per review, and ${userInfo.numberOfReviews} reviews. please respond with a json object contains one field called text, which will contain the recommandation`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }
}
