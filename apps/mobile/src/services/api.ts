import axios, {AxiosInstance} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApiBaseUrl} from '../utils/network';

// API 基础地址
const API_BASE_URL = getApiBaseUrl();

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 支持 Cookie 认证
});

// 请求拦截器 - 添加 token（如果使用 Bearer token）
// 注意：后端主要使用 Cookie 认证，但也可以支持 Bearer token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      // 优先使用 Bearer token，如果没有则依赖 Cookie
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token 过期，清除本地存储并跳转到登录
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
    return Promise.reject(error);
  },
);

