import { Elysia } from 'elysia'
import jwt from '@elysiajs/jwt'
import cookie from '@elysiajs/cookie'
import { UnauthorizedError } from '../errors/base'

/**
 * JWT 配置插件
 * 提供 JWT 功能，但不强制认证
 */
export const jwtPlugin = new Elysia()
  .use(cookie())
  .use(
    jwt({
      name:   'jwt',
      secret: process.env.AUTH_PROFILE!,
      exp:    '7d',
    }),
  )

/**
 * 创建认证中间件
 * 每次调用都返回一个新的中间件实例
 */
export const createAuthMiddleware = () =>
  new Elysia()
    .use(jwtPlugin)
    .derive(async ({ jwt, cookie: { auth } }) => {
      let user = null

      if (auth?.value) {
        try {
          const payload = await jwt.verify(auth.value)
          if (payload) {
            user = payload
          }
        } catch (error) {
          // Token 无效
        }
      }

      return { user }
    })
    .onBeforeHandle(({ user, set }) => {
      // 检查用户是否已登录
      if (!user) {
        set.status = 401
        throw new UnauthorizedError('未登录，请先登录')
      }
    })

/**
 * 认证中间件
 * 验证用户是否已登录，并提供用户信息
 * 使用方式: .use(authMiddleware)
 * 
 * @deprecated 请使用 createAuthMiddleware() 创建新实例
 */
export const authMiddleware = createAuthMiddleware()

/**
 * 可选认证中间件
 * 如果用户已登录则提供用户信息，未登录也不会报错
 * 使用方式: .use(optionalAuthMiddleware)
 */
export const optionalAuthMiddleware = new Elysia({ name: 'optional-auth-middleware' })
  .use(jwtPlugin)
  .derive(async ({ jwt, cookie: { auth } }) => {
    let user = null

    if (auth.value) {
      try {
        const payload = await jwt.verify(auth.value)
        if (payload) {
          user = payload
        }
      } catch (error) {
        // 忽略错误，用户未登录
      }
    }

    return {
      user, // 可能为 null
      isAuthenticated: user !== null,
    }
  })

/**
 * 角色检查中间件工厂
 * 检查用户是否具有指定角色
 * 使用方式: .use(requireRole(['admin', 'super']))
 */
export const requireRole = (allowedRoles: string[]) =>
  new Elysia({ name: 'role-check-middleware' })
    .use(authMiddleware)
    .onBeforeHandle(({ user, set }: any) => {
      if (!user || !allowedRoles.includes(user.role)) {
        set.status = 403
        throw new Error(
          JSON.stringify({
            success: false,
            code:    'FORBIDDEN',
            message: '无权访问此资源',
            details: { requiredRoles: allowedRoles, userRole: user?.role },
          }),
        )
      }
    })
