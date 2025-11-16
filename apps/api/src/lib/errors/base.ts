/**
 * 应用基础错误类
 * 所有自定义错误都应继承此类
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public status: number = 500,
    public details?: any,
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toResponse() {
    return {
      success:   false,
      code:      this.code,
      message:   this.message,
      details:   this.details,
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * 未授权错误 (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未登录或登录已过期') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

/**
 * 禁止访问错误 (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '无权访问此资源') {
    super(message, 'FORBIDDEN', 403)
  }
}

/**
 * 资源不存在错误 (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`, 'NOT_FOUND', 404, { resource })
  }
}

/**
 * 数据验证错误 (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details)
  }
}

/**
 * 冲突错误 (409) - 资源已存在
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details)
  }
}

/**
 * 内部服务器错误 (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误', details?: any) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, details)
  }
}

/**
 * 服务不可用错误 (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = '服务暂时不可用', details?: any) {
    super(message, 'SERVICE_UNAVAILABLE', 503, details)
  }
}
