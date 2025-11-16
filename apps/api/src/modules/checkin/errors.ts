import {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError as BaseValidationError,
} from '../../lib/errors/base'

/**
 * 签到模块基础错误类
 */
export class CheckInError extends AppError {
  constructor(
    message: string,
    code: string = 'CHECKIN_ERROR',
    status: number = 500,
    details?: any,
  ) {
    super(message, code, status, details)
  }
}

/**
 * 重复签到错误
 */
export class DuplicateCheckInError extends ConflictError {
  constructor(lotusId: string, time: string) {
    super(`用户 ${lotusId} 在 ${time} 已有签到记录`, { lotusId, time })
    this.code = 'DUPLICATE_CHECKIN'
  }
}

/**
 * 用户不存在错误
 */
export class UserNotFoundError extends NotFoundError {
  constructor(lotusId: string) {
    super(`用户 ${lotusId}`)
    this.details = { lotusId }
  }
}

/**
 * 头像保存错误
 */
export class AvatarSaveError extends CheckInError {
  constructor(message: string, details?: any) {
    super(message, 'AVATAR_SAVE_ERROR', 500, details)
  }
}

/**
 * 数据验证错误
 */
export class ValidationError extends BaseValidationError {
  constructor(message: string, details?: any) {
    super(message, details)
  }
}
