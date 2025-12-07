import {api} from './api';
import type {CheckinRecord} from '../types';

export interface CheckinListParams {
  lotusId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface CheckinListResponse {
  success: boolean;
  data: {
    records: CheckinRecord[];
    total: number;
    page: number;
    pageSize: number;
  };
  message?: string;
}

export const checkinService = {
  /**
   * 获取打卡记录列表
   */
  getRecords: async (params: CheckinListParams): Promise<CheckinListResponse> => {
    const response = await api.get('/api/v1/checkin/records', {params});
    return response.data;
  },

  /**
   * 获取用户的打卡记录
   */
  getUserRecords: async (lotusId: string, params?: {startDate?: string; endDate?: string; page?: number; pageSize?: number}): Promise<CheckinListResponse> => {
    const response = await api.get(`/api/v1/checkin/records/user/${lotusId}`, {params});
    return response.data;
  },

  /**
   * 获取打卡记录详情
   */
  getRecordById: async (id: string) => {
    const response = await api.get(`/api/v1/checkin/records/${id}`);
    return response.data;
  },
};

