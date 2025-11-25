/**
 * 网络配置
 * 统一管理前端和后端的地址配置
 */

// 环境类型
export type Environment = 'development' | 'lan' | 'production';

// 网络配置
export const NETWORK_CONFIG = {
  // 开发环境（本机）
  development: {
    frontend: 'http://localhost:3000',
    backend: 'http://localhost:3001',
  },
  // 局域网环境
  lan: {
    frontend: 'http://192.168.5.4:3002',
    backend: 'http://192.168.5.4:3001',
  },
  // 生产环境（外网）
  production: {
    frontend: 'http://61.144.183.96:3000',
    backend: 'http://61.144.183.96:3001',
  },
};

// 当前使用的环境 - 修改这里切换环境
// 'development' - 本机开发
// 'lan' - 局域网访问（手机扫码）
// 'production' - 外网访问
export const CURRENT_ENV: Environment = 'lan';

// 端口配置（用于兼容旧代码）
export const PORTS = {
  frontend: 3002,
  backend: 3001,
};

// 局域网IP（用于兼容旧代码）
export const LOCAL_IP = '192.168.5.4';

/**
 * 获取当前访问的主机名
 */
export const getCurrentHostname = (): string => {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname;
};

/**
 * 获取当前访问的端口
 */
export const getCurrentPort = (): string => {
  if (typeof window === 'undefined') return String(PORTS.frontend);
  return window.location.port || String(PORTS.frontend);
};

/**
 * 判断是否是本地访问
 */
export const isLocalhost = (): boolean => {
  const hostname = getCurrentHostname();
  return hostname === 'localhost' || hostname === '127.0.0.1';
};

/**
 * 获取当前环境配置
 */
export const getCurrentConfig = () => {
  return NETWORK_CONFIG[CURRENT_ENV];
};

/**
 * 获取前端访问地址
 * @param forMobile 是否用于手机访问（生成二维码等）
 */
export const getFrontendUrl = (forMobile = false): string => {
  // 如果是为手机生成链接，使用当前配置的前端地址
  if (forMobile) {
    return getCurrentConfig().frontend;
  }
  
  // 否则使用当前浏览器的地址
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return getCurrentConfig().frontend;
};

/**
 * 获取后端API地址
 * @param forMobile 是否用于手机访问
 */
export const getBackendUrl = (forMobile = false): string => {
  return getCurrentConfig().backend;
};

/**
 * 获取完整的API端点URL
 */
export const getApiEndpoint = (path: string, useLocalIP = false): string => {
  const baseUrl = getBackendUrl(useLocalIP);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * 网络配置信息（用于调试）
 */
export const getNetworkInfo = () => {
  return {
    currentEnv: CURRENT_ENV,
    config: getCurrentConfig(),
    localIP: LOCAL_IP,
    currentHostname: getCurrentHostname(),
    currentPort: getCurrentPort(),
    isLocalhost: isLocalhost(),
    frontendUrl: getFrontendUrl(),
    frontendUrlForMobile: getFrontendUrl(true),
    backendUrl: getBackendUrl(),
    backendUrlForMobile: getBackendUrl(true),
  };
};

/**
 * 切换环境（用于调试）
 * 注意：这只是临时切换，刷新页面后会恢复到 CURRENT_ENV 的设置
 */
export const switchEnvironment = (env: Environment) => {
  console.log(`🔄 切换环境: ${CURRENT_ENV} → ${env}`);
  console.log('配置:', NETWORK_CONFIG[env]);
  console.log('⚠️ 注意：这是临时切换，请修改 CURRENT_ENV 常量以永久切换');
};
