import api from './api';
import { User, LoginResponse, ApiResponse } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    return response.data.data!;
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
