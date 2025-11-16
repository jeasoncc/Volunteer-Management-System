import { AppError, UnauthorizedError as BaseUnauthorizedError } from '../../lib/errors/base'

/**
 * 认证模块基础错误类
 */
export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR', status: number = 500, details?: any) {
    super(message, code, status, details)
  }
}

/**
 * 未授权错误
 */
export class UnauthorizedError extends BaseUnauthorizedError {
  constructor(message: string = '未登录或登录已过期') {
    super(message)
  }
}

/**
 * 账号已存在错误
 */
export class AccountExistsError extends AuthError {
  constructor(account: string) {
    super(`账号 ${account} 已存在`, 'ACCOUNT_EXISTS', 409, { account })
  }
}

/**
 * 身份证号已存在错误
 */
export class IdNumberExistsError extends AuthError {
  constructor(idNumber: string) {
    super('身份证号已被注册', 'ID_NUMBER_EXISTS', 409, { idNumber })
  }
}

/**
 * 密码强度不足错误
 */
export class WeakPasswordError extends AuthError {
  constructor(minLength: number = 6) {
    super(`密码至少需要${minLength}个字符`, 'WEAK_PASSWORD', 400, { minLength })
  }
}

/**
 * 登录凭证错误
 */
export class InvalidCredentialsError extends BaseUnauthorizedError {
  constructor() {
    super('账号或密码错误')
    this.code = 'INVALID_CREDENTIALS'
  }
}

/**
 * 模块访问拒绝错误
 */
export class ModuleAccessDeniedError extends AuthError {
  constructor(moduleName: string) {
    super(`无权访问 ${moduleName} 模块`, 'MODULE_ACCESS_DENIED', 403, {
      requiredModule: moduleName,
    })
  }
}
