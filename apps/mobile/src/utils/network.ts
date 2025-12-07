/**
 * 获取 API 基础地址
 * 在开发环境中，需要替换为你的开发机器 IP 地址
 * 在生产环境中，使用实际的 API 服务器地址
 */
export function getApiBaseUrl(): string {
  // 开发环境：使用本地 IP 地址（需要根据实际情况修改）
  // 注意：Android 模拟器使用 10.0.2.2 访问宿主机
  // iOS 模拟器可以直接使用 localhost
  if (__DEV__) {
    // 开发环境配置
    // Android 模拟器使用：
    // return 'http://10.0.2.2:3001';
    
    // iOS 模拟器或真机使用（需要替换为你的实际 IP）：
    // return 'http://192.168.1.100:3001';
    
    // 默认使用 localhost（仅适用于 iOS 模拟器）
    return 'http://localhost:3001';
  }
  
  // 生产环境：使用实际的 API 服务器地址
  return 'https://api.lianhuazhai.com';
}

/**
 * 检查网络连接状态
 */
export async function checkNetworkStatus(): Promise<boolean> {
  try {
    const response = await fetch(getApiBaseUrl() + '/health', {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
