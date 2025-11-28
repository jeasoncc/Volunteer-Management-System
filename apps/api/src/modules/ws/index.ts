import { Elysia } from 'elysia'
import { WebSocketService } from './service'
import { WebSocketConfig } from './config'
import { ConnectionManager } from './connection-manager'
import { errorHandler } from '../../lib/middleware/error-handler'
import { logger } from '../../lib/logger'

/**
 * WebSocket 模块
 * 处理设备 WebSocket 连接和 HTTP 命令接口
 */
export const wsModule = new Elysia()
  // 使用统一的错误处理
  .use(errorHandler)

  // ==================== WebSocket 连接 ====================
  .ws('/ws', {
    open(ws) {
      logger.info('WebSocket 连接已建立')
      ws.send('Connection established')
      // 注意：设备 SN 需要在 declare 消息中获取
    },

    close(_ws, code, reason) {
      logger.info(`WebSocket 连接已关闭: ${code} - ${reason}`)
      // 清理连接（如果有设备 SN 的话）
    },

    error(error) {
      logger.error('WebSocket 错误:', error)
    },

    async message(ws, message: any) {
      try {
        // 处理设备声明
        if (message.cmd === 'declare' && message.type === 'device') {
          const deviceSn = message.sn
          ConnectionManager.register(deviceSn, ws)
          logger.success(`设备 ${deviceSn} 已注册`)
          return
        }

        // 处理心跳包 - 静默处理，不输出日志
        if (message.cmd === 'ping') {
          const deviceSn = message.sn
          // 静默处理心跳包，避免日志污染
          ws.send(JSON.stringify({ cmd: 'pong' }))
          return
        }

        // 处理考勤机返回的消息
        if (message.cmd === 'to_client' && message.data) {
          const { cmd: dataCmd, code, msg, user_id } = message.data
          
          // 处理添加用户的返回结果
          if (dataCmd === 'addUserRet') {
            logger.info(`处理用户添加结果: ${user_id}, code: ${code}`)
            await WebSocketService.handleAddUserResult(user_id, code, msg)
            return
          }
        }

        // 处理其他消息（非心跳包）
        logger.debug('收到其他消息:', message)
      } catch (error) {
        logger.error('处理消息失败:', error)
      }
    },
  })

  // ==================== HTTP 命令接口 ====================

  /**
   * 添加单个用户
   */
  .post(
    '/send/adduser',
    async ({ body }) => {
      return await WebSocketService.addUser(body.lotusId)
    },
    WebSocketConfig.addUser,
  )

  /**
   * 批量添加所有用户
   */
  .post(
    '/send/addAllUser',
    async ({ body }) => {
      return await WebSocketService.addAllUsers(body as any)
    },
    WebSocketConfig.addAllUsers,
  )

  /**
   * 重试失败的用户
   */
  .post('/send/retryFailed', async ({ body }) => {
    const { failedUsers } = body as any
    return await WebSocketService.retryFailedUsers(failedUsers)
  })

  /**
   * 使用Base64格式重试失败的用户
   */
  .post('/send/retryFailedWithBase64', async ({ body }) => {
    const { failedUsers } = body as any
    return await WebSocketService.retryFailedUsersWithBase64(failedUsers)
  })

  /**
   * 删除所有用户
   */
  .post(
    '/send/delAllUser',
    async () => {
      return await WebSocketService.deleteAllUsers()
    },
    WebSocketConfig.deleteAllUsers,
  )

  /**
   * 在线授权
   */
  .post(
    '/send/onlineAuthorization',
    async () => {
      return await WebSocketService.onlineAuthorization()
    },
    WebSocketConfig.onlineAuthorization,
  )

  /**
   * 添加图片广告
   */
  .post(
    '/send/addImageAd',
    async ({ body }) => {
      return await WebSocketService.addImageAd(body)
    },
    WebSocketConfig.addImageAd,
  )

  /**
   * 设置访客申请二维码
   */
  .post(
    '/send/setVisitorApplyValue',
    async ({ body }) => {
      return await WebSocketService.setVisitorQRCode(body)
    },
    WebSocketConfig.setVisitorQRCode,
  )

  /**
   * 获取设备状态
   */
  .get(
    '/device/status',
    () => {
      return WebSocketService.getDeviceStatus()
    },
    WebSocketConfig.getDeviceStatus,
  )

  /**
   * 获取同步进度
   */
  .get('/sync/progress', () => {
    return {
      success: true,
      data: WebSocketService.getSyncProgress(),
    }
  })

  // ==================== 同步记录查询接口 ====================

  /**
   * 获取同步批次列表
   */
  .get('/sync/batches', async ({ query }) => {
    const { SyncLogService } = await import('./sync-log.service')
    return await SyncLogService.getBatchList({
      page: query.page ? Number(query.page) : 1,
      pageSize: query.pageSize ? Number(query.pageSize) : 20,
      startDate: query.startDate as string,
      endDate: query.endDate as string,
    })
  })

  /**
   * 获取同步批次详情
   */
  .get('/sync/batches/:batchId', async ({ params }) => {
    const { SyncLogService } = await import('./sync-log.service')
    return await SyncLogService.getBatchDetail(params.batchId)
  })

  /**
   * 获取用户同步历史
   */
  .get('/sync/user/:lotusId', async ({ params, query }) => {
    const { SyncLogService } = await import('./sync-log.service')
    return await SyncLogService.getUserSyncHistory(
      params.lotusId,
      query.limit ? Number(query.limit) : 10
    )
  })

  /**
   * 获取最近失败的同步记录
   */
  .get('/sync/failures', async ({ query }) => {
    const { SyncLogService } = await import('./sync-log.service')
    return await SyncLogService.getRecentFailures(
      query.limit ? Number(query.limit) : 50
    )
  })

  /**
   * 获取同步统计
   */
  .get('/sync/stats', async ({ query }) => {
    const { SyncLogService } = await import('./sync-log.service')
    return await SyncLogService.getSyncStats(
      query.days ? Number(query.days) : 7
    )
  })

  /**
   * 测试接口
   */
  .post('/homepage', () => {
    return {
      success:   true,
      message:   'WebSocket module is running',
      timestamp: new Date().toISOString(),
    }
  })
