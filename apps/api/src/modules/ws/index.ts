import { Elysia } from 'elysia'
import { WebSocketService } from './service'
import { WebSocketConfig } from './config'
import { ConnectionManager } from './connection-manager'
import { errorHandler } from '../../lib/middleware/error-handler'

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
      console.log('🔌 WebSocket 连接已建立')
      ws.send('Connection established')
      // 注意：设备 SN 需要在 declare 消息中获取
    },

    close(_ws, code, reason) {
      console.log(`🔌 WebSocket 连接已关闭: ${code} - ${reason}`)
      // 清理连接（如果有设备 SN 的话）
    },

    error(error) {
      console.error('❌ WebSocket 错误:', error)
    },

    async message(ws, message: any) {
      try {
        console.log('📨 收到设备消息:', message)

        // 处理设备声明
        if (message.cmd === 'declare' && message.type === 'device') {
          const deviceSn = message.sn
          ConnectionManager.register(deviceSn, ws)
          console.log(`✅ 设备 ${deviceSn} 已注册`)
          return
        }

        // 处理心跳包
        if (message.cmd === 'ping') {
          const deviceSn = message.sn
          console.log(`💓 收到设备 ${deviceSn} 的心跳包`)
          ws.send(JSON.stringify({ cmd: 'pong' }))
          return
        }

        // 处理考勤机返回的消息
        if (message.cmd === 'to_client' && message.data) {
          const { cmd: dataCmd, code, msg, user_id } = message.data
          
          // 处理添加用户的返回结果
          if (dataCmd === 'addUserRet') {
            await WebSocketService.handleAddUserResult(user_id, code, msg)
            return
          }
        }

        // 处理其他消息
        console.log('📩 收到其他消息:', message)
      } catch (error) {
        console.error('❌ 处理消息失败:', error)
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
