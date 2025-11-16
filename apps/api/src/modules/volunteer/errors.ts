// src/modules/volunteer/errors.ts
export class VolunteerError extends Error {
  constructor(
    message: string,
    public options: {
      code?:    string
      status?:  number
      details?: Record<string, unknown>
    } = {},
  ) {
    super(message)
    this.name = 'VolunteerError'
  }

  toResponse() {
    return {
      success:   false,
      code:      this.options.code || 'VOLUNTEER_ERROR',
      message:   this.message,
      ...(this.options.details && { details: this.options.details }),
      timestamp: new Date().toISOString(),
    }
  }
}

export class NotFoundError extends VolunteerError {
  constructor(resource: string, id: string | number) {
    super(`${resource} ${id} 不存在`, {
      code:   'NOT_FOUND',
      status: 404,
    })
  }
}

export class ConflictError extends VolunteerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      code:   'CONFLICT',
      status: 409,
      details,
    })
  }
}

export class ValidationError extends VolunteerError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      code:   'VALIDATION_FAILED',
      status: 422,
      details,
    })
  }
}
