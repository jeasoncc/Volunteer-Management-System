// src/utils/errors.ts
export class ValidationError extends Error {
  constructor(
    public message: string,
    public field?: string,
    public code: string = 'VALIDATION_ERROR',
    public status: number = 400,
    public from: string = '检查器',
    public version: string = '错误检查器的版本',
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
