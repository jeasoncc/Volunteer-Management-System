import { Elysia } from 'elysia'
import jwt from '@elysiajs/jwt'

/**
 * 认证中间件
 * 验证用户是否已登录，并提供用户信息
 */
export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(
    jwt({
      name:   'jwt',
      secret: process.env.AUTH_PROFILE!,
      exp:    '7d',
    }),
  )
  .guard({}, app =>
    app
      .resolve(async ({ jwt, cookie: { auth }, set }) => {
        // 检查是否有 token
        if (!auth.value) {
          set.status = 401
          throw new Error(
            JSON.stringify({
              success: false,
              message: '未登录，请先登录',
              code:    'UNAUTHORIZED',
            }),
          )
        }

        try {
          // 验证 token
          const payload = await jwt.verify(auth.value)

          if (!payload) {
            set.status = 401
            throw new Error(
              JSON.stringify({
                success: false,
                message: '登录已过期，请重新登录',
                code:    'UNAUTHORIZED',
              }),
            )
          }

          // 返回用户信息
          return { user: payload }
        } catch (error) {
          set.status = 401
          throw new Error(
            JSON.stringify({
              success: false,
              message: '认证失败，请重新登录',
              code:    'UNAUTHORIZED',
            }),
          )
        }
      })
      .onError(({ error, set }) => {
        // 处理认证错误
        try {
          const errorData = JSON.parse(error.message)
          set.status = 401
          return errorData
        } catch {
          set.status = 401
          return {
            success: false,
            message: '认证失败',
            code:    'UNAUTHORIZED',
          }
        }
      }),
  )

/**
 * 可选认证中间件
 * 如果用户已登录则提供用户信息，未登录也不会报错
 */
export const optionalAuthMiddleware = new Elysia({ name: 'optional-auth-middleware' })
  .use(
    jwt({
      name:   'jwt',
      secret: process.env.AUTH_PROFILE!,
      exp:    '7d',
    }),
  )
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
