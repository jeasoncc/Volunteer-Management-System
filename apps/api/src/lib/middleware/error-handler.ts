import { Elysia } from 'elysia'
import { AppError } from '../errors/base'
import { createLogger } from '../../log'

const logger = createLogger()

/**
 * 全局错误处理中间件
 * 统一处理所有错误响应格式
 */
export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ code, error, set, request }) => {
    // 记录错误日志
    logger.error(`[${code}] ${request.method} ${request.url}`, error)

    // 处理自定义应用错误
    if (error instanceof AppError) {
      set.status = error.status
      return error.toResponse()
    }

    // 处理 Elysia 内置错误
    if (code === 'VALIDATION') {
      set.status = 400
      return {
        success:   false,
        code:      'VALIDATION_ERROR',
        message:   '请求参数验证失败',
        details:   error,
        timestamp: new Date().toISOString(),
      }
    }

    if (code === 'NOT_FOUND') {
      set.status = 404
      return {
        success:   false,
        code:      'NOT_FOUND',
        message:   '请求的资源不存在',
        timestamp: new Date().toISOString(),
      }
    }

    if (code === 'PARSE') {
      set.status = 400
      return {
        success:   false,
        code:      'PARSE_ERROR',
        message:   '请求数据解析失败',
        details:   error,
        timestamp: new Date().toISOString(),
      }
    }

    // 默认错误处理
    set.status = 500
    return {
      success:   false,
      code:      'INTERNAL_SERVER_ERROR',
      message:   error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString(),
    }
  },
)
