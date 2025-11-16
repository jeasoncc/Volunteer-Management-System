/**
 * 义工服务
 */

import { api, type ApiResponse } from '../lib/api'
import type { Volunteer, PaginationParams, PaginationResponse } from '../types'

export interface VolunteerListParams extends PaginationParams {
  keyword?: string
  status?: string
}

export interface CreateVolunteerParams {
  name: string
  phone: string
  idNumber: string
  gender: 'male' | 'female' | 'other'
  birthDate?: string
  email?: string
  address?: string
  dharmaName?: string
  hasBuddhismFaith?: boolean
  refugeStatus?: 'none' | 'took_refuge' | 'five_precepts' | 'bodhisattva'
  education?: string
  healthConditions?: string
  joinReason?: string
  hobbies?: string
  availableTimes?: string
  emergencyContact?: string
}

export const volunteerService = {
  /**
   * 获取义工列表
   */
  getList: async (params: VolunteerListParams): Promise<ApiResponse<PaginationResponse<Volunteer>>> => {
    return api.get('/volunteer', { params })
  },

  /**
   * 根据 lotusId 获取义工详情
   */
  getByLotusId: async (lotusId: string): Promise<ApiResponse<Volunteer>> => {
    return api.get(`/volunteer/${lotusId}`)
  },

  /**
   * 创建义工
   */
  create: async (data: CreateVolunteerParams): Promise<ApiResponse<Volunteer>> => {
    return api.post('/volunteer', data)
  },

  /**
   * 更新义工信息
   */
  update: async (lotusId: string, data: Partial<CreateVolunteerParams>): Promise<ApiResponse<Volunteer>> => {
    return api.put(`/volunteer/${lotusId}`, data)
  },

  /**
   * 删除义工
   */
  delete: async (lotusId: string): Promise<ApiResponse> => {
    return api.delete(`/volunteer/${lotusId}`)
  },

  /**
   * 搜索义工
   */
  search: async (keyword: string, limit?: number): Promise<ApiResponse<Volunteer[]>> => {
    return api.get('/volunteer/search', { params: { keyword, limit } })
  },

  /**
   * 修改密码
   */
  changePassword: async (lotusId: string, oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    return api.post(`/volunteer/${lotusId}/change-password`, { oldPassword, newPassword })
  },

  /**
   * 变更状态
   */
  changeStatus: async (lotusId: string, status: string): Promise<ApiResponse> => {
    return api.patch(`/volunteer/${lotusId}/status`, { status })
  },

  /**
   * 批量导入
   */
  batchImport: async (volunteers: CreateVolunteerParams[]): Promise<ApiResponse> => {
    return api.post('/volunteer/batch/import', { volunteers })
  },

  /**
   * 批量删除
   */
  batchDelete: async (lotusIds: string[]): Promise<ApiResponse> => {
    return api.post('/volunteer/batch/delete', { lotusIds })
  },
}
