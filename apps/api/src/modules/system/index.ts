/**
 * 系统信息模块
 */

import { Elysia } from 'elysia'
import { getNetworkInfo } from '../../config/network'
import { getAllIPs } from '../../lib/get-local-ip'

export const systemModule = new Elysia({ prefix: '/api/system' })
  /**
   * 获取网络配置信息
   */
  .get('/network', () => {
    const networkInfo = getNetworkInfo()
    const allIPs = getAllIPs()
    
    return {
      success: true,
      data: {
        ...networkInfo,
        allIPs,
      },
    }
  })

  /**
   * 健康检查
   */
  .get('/health', () => {
    return {
      success: true,
      message: 'OK',
      timestamp: new Date().toISOString(),
    }
  })
