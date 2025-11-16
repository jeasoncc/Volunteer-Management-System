import type { Context } from 'elysia'
import { VolunteerError } from '../module/volunteer/errors'
// import { VolunteerError } from '../modules/volunteer/errors'

export const errorFormatter = () => {
  return {
    async onError({ error, set }: { error: unknown; set: Context['set'] }) {
      // 处理已知错误类型
      if (error instanceof VolunteerError) {
        set.status = error.options.status || 500
        return formatVolunteerError(error)
      }

      // 处理Elysia验证错误
      if (isValidationError(error)) {
        set.status = 422
        return formatValidationError(error)
      }

      // 处理其他未知错误
      set.status = 500
      return formatUnknownError(error)
    },
  }
}

// ============== 格式化工具函数 ==============
function formatVolunteerError(error: VolunteerError) {
  return {
    success:   false,
    code:      error.options.code || 'VOLUNTEER_ERROR',
    message:   error.message,
    ...(error.options.details && { details: error.options.details }),
    timestamp: new Date().toISOString(),
  }
}

function formatValidationError(error: any) {
  const simplifiedErrors = error.errors?.map((err: any) => ({
    field:    err.path?.join('.') || 'unknown',
    issue:    err.message || 'Invalid value',
    expected: err.schema
      ? JSON.stringify({
          type: err.schema.type,
          ...(err.schema.minLength && { minLength: err.schema.minLength }),
          ...(err.schema.maxLength && { maxLength: err.schema.maxLength }),
          ...(err.schema.format && { format: err.schema.format }),
        })
      : undefined,
  }))

  return {
    success:   false,
    code:      'VALIDATION_FAILED',
    message:   '输入验证失败',
    errors:    simplifiedErrors,
    timestamp: new Date().toISOString(),
  }
}

function formatUnknownError(error: unknown) {
  return {
    success:   false,
    code:      'INTERNAL_ERROR',
    message:   error instanceof Error ? error.message : '未知服务器错误',
    timestamp: new Date().toISOString(),
  }
}

function isValidationError(error: any): boolean {
  return error?.type === 'validation' && Array.isArray(error?.errors)
}
