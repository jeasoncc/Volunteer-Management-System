/**
 * 网络配置
 * 统一管理前端和后端的地址配置
 */

// 环境类型
export type Environment = 'development' | 'lan' | 'production';

// 动态获取的局域网IP（从后端获取）
let cachedLocalIP: string | null = null;

/**
 * 从后端获取当前的局域网IP（同步版本，立即执行）
 */
function fetchLocalIPSync(): string {
  // 尝试从localStorage获取缓存的IP
  if (typeof window !== 'undefined') {
    const cachedIP = localStorage.getItem('localIP');
    if (cachedIP && cachedIP !== 'localhost' && cachedIP.startsWith('192.168.')) {
      console.log('✅ 使用缓存的局域网IP:', cachedIP);
      return cachedIP;
    }
  }
  
  // 如果没有缓存，立即同步获取（使用XMLHttpRequest）
  if (typeof window !== 'undefined') {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:3001/api/system/network', false); // false = 同步请求
      xhr.send();
      
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.success && data.data.localIP && data.data.localIP.startsWith('192.168.')) {
          localStorage.setItem('localIP', data.data.localIP);
          console.log('✅ 从后端获取局域网IP:', data.data.localIP);
          return data.data.localIP;
        }
      }
    } catch (error) {
      console.warn('⚠️ 无法从后端获取IP，使用默认值');
    }
  }
  
  // 降级方案：返回一个占位符，稍后会被异步更新
  return '192.168.1.157'; // 临时默认值
}

// 网络配置（使用函数以支持动态IP）
function createNetworkConfig(localIP: string) {
  return {
    // 开发环境（本机）
    development: {
      frontend: 'http://localhost:3000',
      backend: 'http://localhost:3001',
    },
    // 局域网环境（动态IP）
    lan: {
      frontend: `http://${localIP}:3000`,
      backend: `http://${localIP}:3001`,
    },
    // 生产环境（外网）
    production: {
      frontend: 'http://61.144.183.96:3000',
      backend: 'http://61.144.183.96:3001',
    },
  };
}

// 动态获取局域网IP（从后端同步获取）
const dynamicLocalIP = fetchLocalIPSync();

// 默认配置（使用动态获取的IP）
export const NETWORK_CONFIG = createNetworkConfig(dynamicLocalIP);

// 当前使用的环境 - 修改这里切换环境
// 'development' - 本机开发
// 'lan' - 局域网访问（手机扫码）
// 'production' - 外网访问
export const CURRENT_ENV: Environment = 'lan';

// 端口配置（用于兼容旧代码）
export const PORTS = {
  frontend: 3000,
  backend: 3001,
};

// 局域网IP（动态获取）
export let LOCAL_IP = dynamicLocalIP;

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
 * 初始化网络配置（从后端异步获取IP并更新）
 */
export async function initNetworkConfig() {
  if (!cachedLocalIP) {
    try {
      const response = await fetch('http://localhost:3001/api/system/network');
      const data = await response.json();
      
      if (data.success && data.data.localIP && data.data.localIP.startsWith('192.168.')) {
        cachedLocalIP = data.data.localIP;
        
        // 缓存到localStorage
        localStorage.setItem('localIP', cachedLocalIP);
        
        // 更新配置
        const newConfig = createNetworkConfig(cachedLocalIP);
        Object.assign(NETWORK_CONFIG, newConfig);
        LOCAL_IP = cachedLocalIP;
        
        console.log('🌐 网络配置已更新:', {
          localIP: cachedLocalIP,
          frontend: newConfig.lan.frontend,
          backend: newConfig.lan.backend,
        });
      }
    } catch (error) {
      console.warn('⚠️ 异步获取IP失败，使用同步获取的值');
    }
  }
  return cachedLocalIP || LOCAL_IP;
}

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
  // 始终使用局域网配置（不使用localhost）
  return NETWORK_CONFIG.lan.frontend;
};

/**
 * 获取后端API地址
 * @param forMobile 是否用于手机访问
 */
export const getBackendUrl = (forMobile = false): string => {
  // 始终使用局域网配置
  return NETWORK_CONFIG.lan.backend;
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
