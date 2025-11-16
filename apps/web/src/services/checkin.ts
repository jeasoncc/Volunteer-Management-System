/**
 * 考勤服务
 */

import { api, type ApiResponse } from '../lib/api'
import type { CheckInRecord, CheckInSummary, PaginationParams, PaginationResponse } from '../types'

export interface CheckInListParams extends PaginationParams {
  lotusId?: string
  startDate?: string
  endDate?: string
}

export interface MonthlyReportParams {
  year: number
  month: number
}

export const checkinService = {
  /**
   * 获取考勤记录列表
   */
  getList: async (params: CheckInListParams): Promise<ApiResponse<PaginationResponse<CheckInRecord>>> => {
    return api.get('/api/v1/summary/list', { params })
  },

  /**
   * 获取用户考勤汇总
   */
  getUserSummary: async (lotusId: string, startDate: string, endDate: string): Promise<ApiResponse<CheckInSummary>> => {
    return api.get('/api/v1/summary/user', { params: { lotusId, startDate, endDate } })
  },

  /**
   * 获取月度考勤报表
   */
  getMonthlyReport: async (params: MonthlyReportParams): Promise<ApiResponse<any>> => {
    return api.get('/api/v1/report/monthly', { params })
  },

  /**
   * 生成月度考勤汇总
   */
  generateMonthlySummary: async (year: number, month: number, force?: boolean): Promise<ApiResponse> => {
    return api.post('/api/v1/summary/generate-monthly', { year, month, force })
  },

  /**
   * 导出志愿者服务时间统计表
   */
  exportVolunteerService: async (startDate: string, endDate: string, lotusIds?: string[], activityName?: string): Promise<Blob> => {
    const params: any = { startDate, endDate }
    if (lotusIds && lotusIds.length > 0) {
      params.lotusIds = lotusIds.join(',')
    }
    if (activityName) {
      params.activityName = activityName
    }

    const response = await api.get('/api/v1/export/volunteer-service', {
      params,
      responseType: 'blob',
    })
    return response as unknown as Blob
  },
}
