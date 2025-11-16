export class AdminError extends Error {
  constructor(
    public message: string,
    public options: {
      status?:  number
      code?:    string
      details?: Record<string, unknown>
    } = {},
  ) {
    super(message)
    this.name = 'AdminError'
  }

  toResponse() {
    return {
      success:   false,
      code:      this.options.code || 'ADMIN_ERROR',
      message:   this.message,
      ...(this.options.details && { details: this.options.details }),
      timestamp: new Date().toISOString(),
    }
  }
}

export class NotFoundError extends AdminError {
  constructor(resource: string, id: string | number) {
    super(`${resource} ${id} 不存在`, {
      status:  404,
      code:    'NOT_FOUND',
      details: { resource, id },
    })
  }
}

export class PermissionError extends AdminError {
  constructor(message = '权限不足') {
    super(message, {
      status: 403,
      code:   'PERMISSION_DENIED',
    })
  }
}

export class ValidationError extends AdminError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      status: 422,
      code:   'VALIDATION_FAILED',
      details,
    })
  }
}

export class ConflictError extends AdminError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      status: 409,
      code:   'CONFLICT',
      details,
    })
  }
}
