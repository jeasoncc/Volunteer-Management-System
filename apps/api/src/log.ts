import type { Elysia } from 'elysia'
import { createLogger as createLoggerFromConfig } from './config/logger'

export const createLogger = createLoggerFromConfig

export type AppLogger = ReturnType<typeof createLogger>

export const loggerPlugin = (logger: AppLogger) => {
  return (app: Elysia) =>
    app
      .decorate('logger', logger)
      .onRequest(({ logger, request }) => {
        logger.info({
          type:   'request_start',
          method: request.method,
          path:   request.url,
          ip:
            request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || 'unknown',
        })
      })
      .onAfterHandle(({ logger, request, set }) => {
        logger.info({
          type:   'request_end',
          method: request.method,
          path:   request.url,
          status: set.status || 200,
        })
      })
      .onError(({ logger, error, request }) => {
        const errorData =
          error instanceof Error
            ? {
                error: error,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
              }
            : { error: String(error) }

        logger.error({
          type:   'error',
          method: request.method,
          path:   request.url,
          ...errorData,
        })
      })
}
