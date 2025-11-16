/**
 * API 客户端配置
 * 基于 Axios，支持请求/响应拦截
 */

import axios, { type AxiosError } from 'axios'

// API 基础地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 创建 axios 实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // 支持 cookie
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 直接返回 data 部分
    return response.data
  },
  (error: AxiosError<any>) => {
    // 统一错误处理
    const message = error.response?.data?.message || error.message || '请求失败'
    
    // 401 未授权
    if (error.response?.status === 401) {
      // 可以跳转到登录页
      console.error('未授权，请先登录')
    }
    
    // 403 禁止访问
    if (error.response?.status === 403) {
      console.error('没有权限访问')
    }
    
    // 500 服务器错误
    if (error.response?.status === 500) {
      console.error('服务器错误')
    }
    
    return Promise.reject(new Error(message))
  }
)

// 导出类型
export type ApiResponse<T = any> = {
  success: boolean
  message?: string
  data?: T
  code?: string
}
