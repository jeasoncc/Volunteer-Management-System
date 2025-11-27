/**
 * 日志工具
 * 为所有日志添加时间戳
 */

function getTimestamp(): string {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export const logger = {
  log: (...args: any[]) => {
    console.log(`[${getTimestamp()}]`, ...args)
  },
  
  info: (...args: any[]) => {
    console.log(`[${getTimestamp()}] ℹ️`, ...args)
  },
  
  success: (...args: any[]) => {
    console.log(`[${getTimestamp()}] ✅`, ...args)
  },
  
  error: (...args: any[]) => {
    console.error(`[${getTimestamp()}] ❌`, ...args)
  },
  
  warn: (...args: any[]) => {
    console.warn(`[${getTimestamp()}] ⚠️`, ...args)
  },
  
  debug: (...args: any[]) => {
    console.debug(`[${getTimestamp()}] 🐛`, ...args)
  },
}
