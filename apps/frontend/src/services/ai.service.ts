import { api } from './api.config';

interface UserInfo {
  amountOfUserStories: number;
  amountOfCommentsPerReview: number;
  numberOfReviews: number;
}

export interface InsightsResponse {
  summary: string;
  recommendations: string;
}

interface QuestionResponse {
  answer: string;
}

export const getWorkerInsights = async (
  projectId: string,
  employeeId: string,
  isHebrew: boolean = true
): Promise<InsightsResponse> => {
  const response = await api.get<InsightsResponse>(
    `/ai/worker-insights?projectId=${projectId}&employeeId=${employeeId}&isHebrew=${isHebrew}`
  );
  return response.data;
};

export const getTeamInsights = async (
  projectId: string,
  employeeIds?: string[],
  isHebrew: boolean = true
): Promise<InsightsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  if (employeeIds?.length) {
    queryParams.append('employeeIds', employeeIds.join(','));
  }
  queryParams.append('isHebrew', isHebrew.toString());

  const response = await api.get<InsightsResponse>(
    `/ai/team-insights?${queryParams.toString()}`
  );
  return response.data;
};

export const getQuestionAnswer = async (
  question: string,
  projectId: string,
  employeeId?: string,
  type?: 'worker' | 'team'
): Promise<QuestionResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('projectId', projectId);
  queryParams.append('question', question);
  if (employeeId) {
    queryParams.append('employeeId', employeeId);
  }
  if (type) {
    queryParams.append('type', type);
  }

  const response = await api.get<QuestionResponse>(
    `/ai/question?${queryParams.toString()}`
  );
  return response.data;
};
