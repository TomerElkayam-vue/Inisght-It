import { api } from './api.config';

interface UserInfo {
  amountOfUserStories: number;
  amountOfCommentsPerReview: number;
  numberOfReviews: number;
}

export interface InsightsResponse {
  metrics: {
    pullRequests: number;
    codeReviews: number;
    averageCommentsPerPR: number;
    issuesCompleted: number;
    averageIssueTime: number;
    totalStoryPoints: number;
  };
  summary: string;
  recommendations: string[];
}

interface QuestionDTO {
  question: string;
  metrics?: {
    pullRequests: number;
    codeReviews: number;
    averageCommentsPerPR: number;
    issuesCompleted: number;
    averageIssueTime: number;
    totalStoryPoints: number;
  };
  type?: 'worker' | 'team';
}

interface QuestionResponse {
  answer: string;
}

export const getWorkerInsights = async (
  projectId: string,
  userId: string,
  isHebrew: boolean = true
): Promise<InsightsResponse> => {
  const response = await api.get<InsightsResponse>(
    `/ai/worker-insights?projectId=${projectId}&userId=${userId}&isHebrew=${isHebrew}`
  );
  return response.data;
};

export const getTeamInsights = async (
  projectId: string,
  userIds?: string[],
  isHebrew: boolean = true
): Promise<InsightsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  if (userIds?.length) {
    queryParams.append('userIds', userIds.join(','));
  }
  queryParams.append('isHebrew', isHebrew.toString());

  const response = await api.get<InsightsResponse>(
    `/ai/team-insights?${queryParams.toString()}`
  );
  return response.data;
};

export const getQuestionAnswer = async (
  question: QuestionDTO,
  projectId: string,
  userId?: string,
  type?: 'worker' | 'team'
): Promise<QuestionResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  if (userId) {
    queryParams.append('userId', userId);
  }
  if (type) {
    queryParams.append('type', type);
  }

  const response = await api.get<QuestionResponse>(
    `/ai/questions?${queryParams.toString()}`,
    {
      data: question,
    }
  );
  return response.data;
};

export const getRecommendation = async (
  userInfo: UserInfo
): Promise<string> => {
  const response = await api.post<string>('/ai/recommendation', userInfo);
  return response.data;
};
