import axios from "axios";
import { api } from "./api.config";

interface LoginResponse {
  access_token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<string> => {
  try {
    console.log("credentials", credentials);
    const {
      data: { access_token },
    } = await api.post<LoginResponse>("/auth/login", credentials);

    console.log("access_token", access_token);

    return access_token;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw error;
  }
};

export const saveToken = (token: string): void => {
  localStorage.setItem("jwt_token", token);
  // Set token for future requests
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const getToken = (): string | null => {
  return localStorage.getItem("jwt_token");
};

export const removeToken = (): void => {
  localStorage.removeItem("jwt_token");
  // Remove token from future requests
  delete api.defaults.headers.common["Authorization"];
};
