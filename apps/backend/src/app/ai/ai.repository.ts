import { Inject, Injectable } from '@nestjs/common';
import { UserInfo } from './types/user-info.type';
import * as geminiConfig from '../../config/gemini-config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuestionDTO } from './dto/question.class';

@Injectable()
export class AiRepository {
  constructor(
    @Inject(geminiConfig.geminiConfig.KEY)
    private readonly geminiConfigValues: geminiConfig.GeminiConfigType
  ) {}

  genAI = new GoogleGenerativeAI(this.geminiConfigValues.geminiKey ?? '');
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async getWorkerRecommendation(userInfo: UserInfo): Promise<string> {
    const userInfoStr = JSON.stringify(userInfo, null, 2);
    const prompt = `Give your recommendation and summery in the hebrew language about a worker with this data: ${userInfoStr}. Do not translate userData terms to hebrew. Give a balanced opnion not longer than 5 sentances. Please respond with a json object contains one field called text, which will contain the recommandation`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async getTeamRecommendation(userInfo: UserInfo): Promise<string> {
    const userInfoStr = JSON.stringify(userInfo, null, 2);
    const prompt = `Give your recommendation and summery in the hebrew language about a team with this data: ${userInfoStr}. Do not translate userData terms to hebrew. Give a balanced opnion not longer than 5 sentances. Please respond with a json object contains one field called text, which will contain the recommandation`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async getWorkerSummary(userInfo: UserInfo): Promise<string> {
    const userInfoStr = JSON.stringify(userInfo, null, 2);
    const prompt = `Give a detailed summary in hebrew language about a worker's performance with this data: ${userInfoStr}. Do not translate userData terms to hebrew. Give a balanced opnion not longer than 5 sentances. Please respond with a json object contains one field called text, which will contain the summary`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async getTeamSummary(userInfo: UserInfo): Promise<string> {
    const userInfoStr = JSON.stringify(userInfo, null, 2);
    const prompt = `Give a detailed summary in hebrew language about a team's performance with this data: ${userInfoStr}. Do not translate userData terms to hebrew. Give a balanced opnion not longer than 5 sentances. Please respond with a json object contains one field called text, which will contain the summary`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async getQuestionAnswer(question: QuestionDTO): Promise<string> {
    const metricsStr = question.metrics
      ? JSON.stringify(question.metrics, null, 2)
      : '';
    const contextStr = question.type === 'worker' ? 'עובד' : 'צוות';
    const prompt = `Answer the following question in hebrew language about a ${contextStr} with these metrics: ${metricsStr}\n\nQuestion: ${question.question}\n\nPlease respond with a json object contains one field called text, which will contain the answer`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }
}
