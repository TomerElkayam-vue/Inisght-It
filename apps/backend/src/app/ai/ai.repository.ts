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
    const prompt = `Give your recommendation and summary in the Hebrew language about a worker that has done ${userInfo.amountOfUserStories} user stories, and ${userInfo.amountOfCommentsPerReview} comments per review, and ${userInfo.numberOfReviews} reviews. Please respond with a JSON object containing one field called text, which will contain the recommendation`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async generateResponse(prompt: string): Promise<string> {
    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return result.response.text();
  }
}
