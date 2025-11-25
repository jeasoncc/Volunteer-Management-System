import { Elysia } from 'elysia'
import { join } from 'path'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { db } from '../../db'
import { volunteer } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { errorHandler } from '../../lib/middleware/error-handler'
import { authMiddleware } from '../../lib/middleware/auth'
import { ValidationError } from '../../lib/errors/base'
import { createLogger } from '../../log'
import { randomBytes } from 'crypto'

const logger = createLogger()
const AVATAR_DIR = join(process.cwd(), 'public/upload/avatar')

// 确保目录存在
if (!existsSync(AVATAR_DIR)) {
  mkdirSync(AVATAR_DIR, { recursive: true })
}

// 存储上传令牌和对应的图片URL
// 格式: { token: { url: string, createdAt: number } }
const uploadTokens = new Map<string, { url?: string; createdAt: number }>()

/**
 * 上传模块
 * 处理文件上传（照片等）
 */
export const uploadModule = new Elysia({ prefix: '/api/upload' })
  .use(errorHandler)
  
  /**
   * 公开的头像上传接口（用于注册）
   * 不需要登录
   */
  .post('/avatar/public', async ({ body }: any) => {
    const { file } = body

    // 验证文件
    if (!file) {
      throw new ValidationError('请选择文件')
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('只支持 JPG 和 PNG 格式')
    }

    // 验证文件大小（2MB）
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      throw new ValidationError('文件大小不能超过 2MB')
    }

    try {
      // 生成文件名
      const timestamp = Date.now()
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `temp-${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

      // 保存文件
      const filePath = join(AVATAR_DIR, fileName)
      const buffer = await file.arrayBuffer()
      writeFileSync(filePath, Buffer.from(buffer))

      const url = `/upload/avatar/${fileName}`

      logger.info(`📸 公开照片上传成功: ${fileName} (${(file.size / 1024).toFixed(2)} KB)`)

      return {
        success: true,
        message: '照片上传成功',
        data: { url },
      }
    } catch (error) {
      logger.error(`照片上传失败: ${error}`)
      throw new ValidationError('照片上传失败', error instanceof Error ? error.message : String(error))
    }
  })

  .use(authMiddleware) // 以下接口需要登录

  /**
   * 上传头像（需要登录）
   */
  .post('/avatar', async ({ body }: any) => {
    const { file, lotusId } = body

    // 验证文件
    if (!file) {
      throw new ValidationError('请选择文件')
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('只支持 JPG 和 PNG 格式')
    }

    // 验证文件大小（2MB）
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      throw new ValidationError('文件大小不能超过 2MB')
    }

    try {
      // 生成文件名
      const timestamp = Date.now()
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = lotusId ? `${lotusId}-${timestamp}.${ext}` : `${timestamp}.${ext}`

      // 保存文件
      const filePath = join(AVATAR_DIR, fileName)
      const buffer = await file.arrayBuffer()
      writeFileSync(filePath, Buffer.from(buffer))

      const url = `/upload/avatar/${fileName}`

      logger.info(`📸 照片上传成功: ${fileName} (${(file.size / 1024).toFixed(2)} KB)`)

      // 如果提供了 lotusId，自动更新用户头像
      if (lotusId) {
        const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

        if (user) {
          await db.update(volunteer).set({ avatar: url }).where(eq(volunteer.lotusId, lotusId))

          logger.info(`📸 用户 ${lotusId}(${user.name}) 头像已更新: ${url}`)

          return {
            success: true,
            message: '照片上传成功，已自动关联到用户',
            data:    {
              url,
              lotusId,
              userName: user.name,
            },
          }
        } else {
          logger.warn(`⚠️  用户 ${lotusId} 不存在，照片已上传但未关联`)

          return {
            success: true,
            message: '照片上传成功，但用户不存在',
            data:    {
              url,
              lotusId,
              warning: '用户不存在，请手动关联',
            },
          }
        }
      }

      return {
        success: true,
        message: '照片上传成功',
        data:    { url },
      }
    } catch (error) {
      logger.error(`照片上传失败: ${error}`)
      throw new ValidationError('照片上传失败', error instanceof Error ? error.message : String(error))
    }
  })

  /**
   * 生成手机上传令牌
   */
  .post('/token', async () => {
    try {
      // 生成随机令牌
      const token = randomBytes(16).toString('hex')
      
      // 存储令牌（10分钟有效期）
      uploadTokens.set(token, {
        createdAt: Date.now(),
      })

      // 清理过期令牌（10分钟）
      const now = Date.now()
      const expireTime = 10 * 60 * 1000
      for (const [key, value] of uploadTokens.entries()) {
        if (now - value.createdAt > expireTime) {
          uploadTokens.delete(key)
        }
      }

      logger.info(`🔑 生成手机上传令牌: ${token}`)

      return {
        success: true,
        message: '令牌生成成功',
        data: { token },
      }
    } catch (error) {
      logger.error(`生成令牌失败: ${error}`)
      throw new ValidationError('生成令牌失败')
    }
  })

  /**
   * 检查上传状态
   */
  .get('/status/:token', async ({ params }: any) => {
    const { token } = params

    const tokenData = uploadTokens.get(token)

    if (!tokenData) {
      return {
        success: false,
        message: '令牌无效或已过期',
        data: null,
      }
    }

    // 检查是否已上传
    if (tokenData.url) {
      return {
        success: true,
        message: '已上传',
        data: { url: tokenData.url },
      }
    }

    return {
      success: true,
      message: '等待上传',
      data: null,
    }
  })

  /**
   * 手机端上传接口（不需要登录）
   */
  .post('/mobile', async ({ body }: any) => {
    const { file, token } = body

    // 验证令牌
    if (!token) {
      throw new ValidationError('缺少上传令牌')
    }

    const tokenData = uploadTokens.get(token)
    if (!tokenData) {
      throw new ValidationError('令牌无效或已过期')
    }

    // 检查令牌是否过期（10分钟）
    const expireTime = 10 * 60 * 1000
    if (Date.now() - tokenData.createdAt > expireTime) {
      uploadTokens.delete(token)
      throw new ValidationError('令牌已过期，请重新扫码')
    }

    // 验证文件
    if (!file) {
      throw new ValidationError('请选择文件')
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('只支持 JPG、PNG、WEBP 格式')
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new ValidationError('文件大小不能超过 5MB')
    }

    try {
      // 生成文件名
      const timestamp = Date.now()
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `mobile-${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

      // 保存文件
      const filePath = join(AVATAR_DIR, fileName)
      const buffer = await file.arrayBuffer()
      writeFileSync(filePath, Buffer.from(buffer))

      const url = `/upload/avatar/${fileName}`

      // 更新令牌数据
      tokenData.url = url
      uploadTokens.set(token, tokenData)

      logger.info(`📱 手机上传成功: ${fileName} (${(file.size / 1024).toFixed(2)} KB)`)

      return {
        success: true,
        message: '上传成功',
        data: { url },
      }
    } catch (error) {
      logger.error(`手机上传失败: ${error}`)
      throw new ValidationError('上传失败', error instanceof Error ? error.message : String(error))
    }
  })

  /**
   * 批量上传头像
   */
  .post('/avatars/batch', async ({ body }: any) => {
    const { files } = body

    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new ValidationError('请选择文件')
    }

    const results = []

    for (const file of files) {
      try {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
          results.push({
            success:  false,
            fileName: file.name,
            error:    '只支持 JPG 和 PNG 格式',
          })
          continue
        }

        // 验证文件大小
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
          results.push({
            success:  false,
            fileName: file.name,
            error:    '文件大小不能超过 2MB',
          })
          continue
        }

        // 生成文件名
        const timestamp = Date.now()
        const ext = file.name.split('.').pop() || 'jpg'
        const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

        // 保存文件
        const filePath = join(AVATAR_DIR, fileName)
        const buffer = await file.arrayBuffer()
        writeFileSync(filePath, Buffer.from(buffer))

        const url = `/upload/avatar/${fileName}`

        results.push({
          success:  true,
          fileName: file.name,
          url,
        })

        logger.info(`📸 批量上传: ${file.name} → ${fileName}`)
      } catch (error) {
        results.push({
          success:  false,
          fileName: file.name,
          error:    error instanceof Error ? error.message : '上传失败',
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    logger.info(`📊 批量上传完成: 成功 ${successCount}, 失败 ${failCount}`)

    return {
      success: true,
      message: `批量上传完成: 成功 ${successCount}, 失败 ${failCount}`,
      data:    {
        results,
        summary: {
          total:   files.length,
          success: successCount,
          fail:    failCount,
        },
      },
    }
  })
