/**
 * 后端网络配置
 * 与前端 apps/web/src/config/network.ts 保持一致
 */

// 环境类型
export type Environment = 'development' | 'lan' | 'production'

// 网络配置
export const NETWORK_CONFIG = {
  // 开发环境（本机）
  development: {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:3001',
  },
  // 局域网环境
  lan: {
    frontend: 'http://192.168.5.4:3000',
    backend: 'http://192.168.5.4:3001',
  },
  // 生产环境（外网）
  production: {
    frontend: 'http://61.144.183.96:3000',
    backend: 'http://61.144.183.96:3001',
  },
}

// 当前使用的环境 - 修改这里切换环境
// 'development' - 本机开发
// 'lan' - 局域网访问（考勤机访问）
// 'production' - 外网访问
export const CURRENT_ENV: Environment = 
  (process.env.NODE_ENV as Environment) || 'lan'

/**
 * 获取当前环境配置
 */
export const getCurrentConfig = () => {
  return NETWORK_CONFIG[CURRENT_ENV]
}

/**
 * 获取后端地址（用于考勤机访问照片）
 */
export const getBackendUrl = (): string => {
  // 优先使用环境变量
  if (process.env.ATTENDANCE_DEVICE_BASE_URL) {
    return process.env.ATTENDANCE_DEVICE_BASE_URL
  }
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL
  }
  
  // 否则使用配置文件
  return getCurrentConfig().backend
}

/**
 * 获取前端地址
 */
export const getFrontendUrl = (): string => {
  return getCurrentConfig().frontend
}

/**
 * 网络配置信息（用于调试）
 */
export const getNetworkInfo = () => {
  return {
    currentEnv: CURRENT_ENV,
    config: getCurrentConfig(),
    backendUrl: getBackendUrl(),
    frontendUrl: getFrontendUrl(),
  }
}
