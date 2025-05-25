import { api } from "./api.config";
import { simpleUser } from "../components/ProjectManagment/interfaces";

export const usersService = {
  getUsers: async () => {
    const response = await api.get<simpleUser[]>(
      '/users'
    );
    return response.data;
  },
};
