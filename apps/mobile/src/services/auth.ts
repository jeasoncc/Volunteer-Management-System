import {api} from './api';
import type {User} from '../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      account: string;
      name: string;
      role: string;
      avatar?: string;
      email?: string;
      adminInfo?: any;
    };
    token: string;
  };
}

export const authService = {
  /**
   * 用户登录
   */
  login: async (account: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', {
      account,
      password,
    });
    return response.data;
  },

  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: async (): Promise<{success: boolean; data?: any}> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

