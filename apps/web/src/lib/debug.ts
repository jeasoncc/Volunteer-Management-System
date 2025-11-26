/**
 * 调试工具
 * 在浏览器控制台使用
 */

import { getNetworkInfo, CURRENT_ENV, NETWORK_CONFIG } from '@/config/network';

// 将调试工具挂载到 window 对象
if (typeof window !== 'undefined') {
  (window as any).kiroDebug = {
    // 查看网络配置
    network: getNetworkInfo,
    
    // 查看当前环境
    env: () => {
      console.log('当前环境:', CURRENT_ENV);
      console.log('配置:', NETWORK_CONFIG[CURRENT_ENV]);
      return { env: CURRENT_ENV, config: NETWORK_CONFIG[CURRENT_ENV] };
    },
    
    // 测试API请求
    testApi: async () => {
      try {
        const { api } = await import('@/lib/api');
        console.log('API baseURL:', (api.defaults as any).baseURL);
        const response = await api.get('/api/auth/me');
        console.log('API测试成功:', response);
        return response;
      } catch (error) {
        console.error('API测试失败:', error);
        throw error;
      }
    },
    
    // 帮助信息
    help: () => {
      console.log(`
🔧 Kiro 调试工具

可用命令:
- kiroDebug.network()     查看网络配置
- kiroDebug.env()          查看当前环境
- kiroDebug.testApi()      测试API连接
- kiroDebug.help()         显示帮助

示例:
> kiroDebug.env()
> kiroDebug.network()
      `);
    }
  };
  
  // 启动时显示提示
  console.log('💡 输入 kiroDebug.help() 查看调试命令');
}
