import { RegisterRequestSchema, LoginRequestSchema } from './model'

/**
 * 认证模块路由配置
 */
export const AuthConfig = {
  /**
   * 用户注册
   */
  register:       {
    body:   RegisterRequestSchema,
    detail: {
      summary:     '用户注册',
      description: '注册新用户账号',
      tags:        ['Auth'],
    },
  },

  /**
   * 用户登录
   */
  login:          {
    body:   LoginRequestSchema,
    detail: {
      summary:     '用户登录',
      description: '使用账号密码登录系统',
      tags:        ['Auth'],
    },
  },

  /**
   * 用户登出
   */
  logout:         {
    detail: {
      summary:     '用户登出',
      description: '退出登录，清除会话',
      tags:        ['Auth'],
    },
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser: {
    detail: {
      summary:     '获取当前用户',
      description: '获取当前登录用户的信息',
      tags:        ['Auth'],
    },
  },
}
