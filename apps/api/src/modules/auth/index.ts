import { Elysia } from 'elysia'
import { registerUser, loginUser } from '../../lib/auth'
import { AuthConfig } from './config'
import { jwtPlugin } from '../../lib/middleware/auth'
import { errorHandler } from '../../lib/middleware/error-handler'

/**
 * 认证模块
 * 处理用户注册、登录、登出等认证相关功能
 */
export const authModule = new Elysia({ prefix: '/api/auth' })
  .use(errorHandler)
  .use(jwtPlugin)

  // 用户注册
  .post(
    '/register',
    async ({ body, set }) => {
      try {
        if (body.password.length < 6) {
          set.status = 400
          return {
            success: false,
            message: '密码至少需要6个字符',
          }
        }

        const user = await registerUser({
          account:  body.account,
          password: body.password,
          name:     body.name,
          phone:    body.phone,
          gender:   body.gender,
          idNumber: body.idNumber,
          email:    body.email,
        })

        return {
          success: true,
          message: '注册成功',
          data:    user,
        }
      } catch (error: any) {
        set.status = 400
        return {
          success: false,
          message: error.message || '注册失败',
        }
      }
    },
    AuthConfig.register,
  )

  // 用户登录
  .post(
    '/login',
    async ({ body, jwt, cookie: { auth }, set }) => {
      try {
        const user = await loginUser(body.account, body.password)

        // 生成 JWT token
        const token = await jwt.sign({
          id:      user.id,
          account: user.account,
          role:    user.role || 'volunteer',
        })

        // 设置 cookie
        auth.set({
          value:    token,
          httpOnly: true,
          maxAge:   7 * 86400, // 7天
          path:     '/',
        })

        return {
          success: true,
          message: '登录成功',
          data:    {
            user:      {
              id:      user.id,
              account: user.account,
              name:    user.name,
              role:    user.role,
              avatar:  user.avatar,
              email:   user.email,
            },
            adminInfo: user.adminInfo,
            token,
          },
        }
      } catch (error: any) {
        set.status = 401
        return {
          success: false,
          message: error.message || '登录失败',
        }
      }
    },
    AuthConfig.login,
  )

  // 用户登出
  .post(
    '/logout',
    async ({ cookie: { auth } }) => {
      auth.remove()
      return {
        success: true,
        message: '登出成功',
      }
    },
    AuthConfig.logout,
  )

  // 获取当前用户信息
  .get(
    '/me',
    async ({ jwt, cookie: { auth }, set }) => {
      try {
        if (!auth.value) {
          set.status = 401
          return {
            success: false,
            message: '未登录',
          }
        }

        const payload = await jwt.verify(auth.value)
        if (!payload) {
          set.status = 401
          return {
            success: false,
            message: '登录已过期',
          }
        }

        return {
          success: true,
          data:    payload,
        }
      } catch (error) {
        set.status = 401
        return {
          success: false,
          message: '认证失败',
        }
      }
    },
    AuthConfig.getCurrentUser,
  )
