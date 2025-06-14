import { Employee } from '@prisma/client';
import { api } from './api.config';

export const connectEmployeesOnProject = async (
  projectId: string
): Promise<Employee[]> => {
  const response = await api.post<Employee[]>(
    `/employees/connect-names?projectId=${projectId}`
  );
  return response.data;
};
