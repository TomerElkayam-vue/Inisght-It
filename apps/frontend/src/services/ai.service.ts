import { UserActivity } from '../types/github-activity';
import { api } from './api.config';

export interface UserInfo {
  amountOfUserStories: number;
  amountOfCommentsPerReview: number;
  numberOfReviews: number;
}

export const getAiRecommendation = async (
  userInfo: UserInfo
): Promise<string> => {
  const response = await api.post<string>('/ai/recommendation', userInfo);
  return response.data;
};
