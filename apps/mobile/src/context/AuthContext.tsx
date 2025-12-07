import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authService} from '../services/auth';
import {volunteerService} from '../services/volunteer';
import type {User} from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (account: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // 从本地存储加载用户信息
        const userData = await AsyncStorage.getItem('user_data');
        if (userData) {
          setUser(JSON.parse(userData));
        }
        // 可选：在后台尝试从 API 获取最新用户信息并更新
        // 这里先使用本地数据，避免阻塞启动
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (account: string, password: string) => {
    try {
      const response = await authService.login(account, password);

      if (response.success && response.data?.user) {
        const userData = response.data.user;
        const token = response.data.token || '';
        
        // 保存 token
        await AsyncStorage.setItem('auth_token', token);
        
        // 登录后通过 account 获取完整用户信息（包含 lotusId 和 phone）
        try {
          const volunteerResponse = await volunteerService.getList({
            account,
            page: 1,
            pageSize: 1,
          });
          
          if (volunteerResponse.success && volunteerResponse.data?.records?.[0]) {
            const fullUserData = volunteerResponse.data.records[0];
            const user: User = {
              id: fullUserData.id || userData.id,
              lotusId: fullUserData.lotusId || account,
              account: fullUserData.account || account,
              name: fullUserData.name || userData.name,
              phone: fullUserData.phone || '',
              email: fullUserData.email || userData.email,
              avatar: fullUserData.avatar || userData.avatar,
              lotusRole: (fullUserData.lotusRole || userData.role) === 'admin' ? 'admin' : 'volunteer',
              adminInfo: fullUserData.adminInfo || userData.adminInfo,
            };
            setUser(user);
            await AsyncStorage.setItem('user_data', JSON.stringify(user));
            return;
          }
        } catch (error) {
          console.log('获取完整用户信息失败，使用登录返回的数据:', error);
        }
        
        // 如果获取完整信息失败，使用登录返回的数据
        const user: User = {
          id: userData.id,
          lotusId: userData.lotusId || account, // 使用 account 作为 lotusId
          account: userData.account || account,
          name: userData.name,
          phone: userData.phone || '',
          email: userData.email,
          avatar: userData.avatar,
          lotusRole: userData.role === 'admin' ? 'admin' : 'volunteer',
          adminInfo: userData.adminInfo,
        };
        setUser(user);
        await AsyncStorage.setItem('user_data', JSON.stringify(user));
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || '登录失败');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

