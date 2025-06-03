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
    const promt = `Give your recommendation and summery in the hebrew language about a worker that have done ${userInfo.amountOfUserStories} Suser stories, and ${userInfo.amountOfCommentsPerReview} comments per review, and ${userInfo.numberOfReviews} reviews. please respond with a json object contains one field called text, which will contain the recommandation`;

    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const response = JSON.parse(result.response.text()).text;
    return response;
  }

  async getRelatedMergeRequestTitle(
    mergeRequests: {
      title: string;
      owner: string | undefined;
      createdAt: string;
      mergedAt: string;
    }[],
    jiraIssues: any[]
  ): Promise<any | undefined> {
    const promt = `Given the following array of merge request objects and an array of jira issues, your task is to match between merge requests whose title is most closely related or equivalent to the issue name.
  
  **Merge Requests:**
  ${JSON.stringify(mergeRequests, null, 2)}
  
  **Jira Issues:** "${JSON.stringify(jiraIssues, null, 2)}"
  
  Please respond with a JSON object containing one field called 'text'. This 'text' field should contain an array of objects, each object containing all the fields of the merge request and all the fields of issue combined`;

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
