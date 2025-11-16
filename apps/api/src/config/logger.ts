import pino from 'pino'

/**
 * 日志配置
 */
export const loggerConfig = {
  // 日志级别
  level:       process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // 时间戳格式
  timestamp:   () => `,"time":"${new Date().toISOString()}"`,

  // 开发环境配置
  development: {
    transport: {
      target:  'pino-pretty',
      options: {
        colorize:      true,
        translateTime: 'HH:MM:ss',
        ignore:        'pid,hostname',
        singleLine:    false,
        // 隐藏长字符串（如 base64 图片）
        messageFormat: '{msg}',
      },
    },
  },

  // 生产环境配置
  production:  {
    transport: {
      targets: [
        {
          target:  'pino/file',
          level:   'info',
          options: {
            destination: './logs/app.log',
            mkdir:       true,
          },
        },
        {
          target:  'pino/file',
          level:   'error',
          options: {
            destination: './logs/error.log',
            mkdir:       true,
          },
        },
      ],
    },
  },
}

/**
 * 创建日志实例
 */
export const createLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production'

  return pino({
    level:     loggerConfig.level,
    timestamp: loggerConfig.timestamp,
    transport: isProduction
      ? loggerConfig.production.transport
      : loggerConfig.development.transport,
  })
}

/**
 * 截断长字符串（用于日志输出）
 */
export const truncateString = (str: string, maxLength: number = 50): string => {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return `${str.substring(0, maxLength)}... (长度: ${str.length})`
}

/**
 * 检查是否为 base64 图片数据
 */
export const isBase64Image = (str: string): boolean => {
  return str.startsWith('data:image/') || str.startsWith('%2Fdata%3Aimage')
}

/**
 * 格式化日志数据（隐藏敏感信息）
 */
export const sanitizeLogData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  const sanitized = { ...data }

  // 隐藏 base64 图片
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      if (isBase64Image(sanitized[key])) {
        sanitized[key] = '[BASE64_IMAGE]'
      } else if (sanitized[key].length > 100) {
        sanitized[key] = truncateString(sanitized[key], 100)
      }
    }
  }

  return sanitized
}
