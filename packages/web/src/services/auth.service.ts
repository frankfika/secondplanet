import api, { ApiResponse, setTokens, clearTokens } from './api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  globalId: string;
  createdAt: string;
}

export const authService = {
  async register(data: RegisterDto): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User } & AuthTokens>>('/auth/register', data);
    const { accessToken, refreshToken, user } = response.data.data;
    setTokens(accessToken, refreshToken);
    return user;
  },

  async login(data: LoginDto): Promise<User> {
    const response = await api.post<ApiResponse<{ user: User } & AuthTokens>>('/auth/login', data);
    const { accessToken, refreshToken, user } = response.data.data;
    setTokens(accessToken, refreshToken);
    return user;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  logout() {
    clearTokens();
  },
};
