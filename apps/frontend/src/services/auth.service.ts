import axios from "axios";
import { api } from "./api.config";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  firstName: string;
  lastName: string;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export const login = async (credentials: LoginCredentials): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    console.log("credentials", credentials);
    const {
      data: { access_token, refresh_token },
    } = await api.post<LoginResponse>("/auth/login", credentials);

    console.log("access_token", access_token);

    return { accessToken: access_token, refreshToken: refresh_token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
    throw error;
  }
};

export const register = async (
  credentials: RegisterCredentials
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const {
      data: { access_token, refresh_token },
    } = await api.post<LoginResponse>("/auth/register", credentials);

    return { accessToken: access_token, refreshToken: refresh_token };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw error;
  }
};

export const refreshToken = async (): Promise<{ accessToken: string; refreshToken: string }> => {
  const currentRefreshToken = getRefreshToken();
  if (!currentRefreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const {
      data: { access_token, refresh_token },
    } = await axios.post<RefreshResponse>(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
      refresh_token: currentRefreshToken,
    });

    return { accessToken: access_token, refreshToken: refresh_token };
  } catch (error) {
    removeTokens();
    window.location.href = '/';
    throw new Error("Session expired. Please login again.");
  }
};

export const saveTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem("jwt_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  // Set token for future requests
  api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
};

export const getToken = (): string | null => {
  return localStorage.getItem("jwt_token");
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refresh_token");
};

export const removeTokens = (): void => {
  localStorage.removeItem("jwt_token");
  localStorage.removeItem("refresh_token");
  // Remove token from future requests
  delete api.defaults.headers.common["Authorization"];
};

export const saveToken = (token: string): void => {
  localStorage.setItem("jwt_token", token);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const removeToken = (): void => {
  removeTokens();
};
