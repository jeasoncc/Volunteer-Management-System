import {api} from './api';
import type {User} from '../types';

export interface VolunteerListParams {
  page?: number;
  pageSize?: number;
  account?: string;
  name?: string;
  lotusId?: string;
}

export interface VolunteerListResponse {
  success: boolean;
  data?: {
    records: User[];
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

export const volunteerService = {
  /**
   * 获取义工列表
   */
  getList: async (params: VolunteerListParams): Promise<VolunteerListResponse> => {
    const response = await api.get('/api/volunteer', {params});
    return response.data;
  },

  /**
   * 根据 lotusId 获取义工信息
   */
  getByLotusId: async (lotusId: string) => {
    const response = await api.get(`/api/volunteer/${lotusId}`);
    return response.data;
  },
};

