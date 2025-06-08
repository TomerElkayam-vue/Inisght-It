import { api } from './api.config';
import { simpleUser } from '../components/ProjectManagment/interfaces';

export interface UserDetails {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export const usersService = {
  getUsers: async () => {
    const response = await api.get<simpleUser[]>('/users');
    return response.data;
  },
};

export const getUserDetails = async (userId: string): Promise<UserDetails> => {
  const response = await api.get<UserDetails>(`/users/${userId}`);
  return response.data;
};
