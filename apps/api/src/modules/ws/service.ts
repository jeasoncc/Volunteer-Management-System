import { db } from '../../db'
import { volunteer } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { file as fileType } from 'bun'
import { ConnectionManager } from './connection-manager'
import {
  AddUserCommand,
  DeleteAllUsersCommand,
  OnlineAuthorizationCommand,
  AddImageAdCommand,
  SetVisitorQRCodeCommand,
  GetUserInfoCommand,
  GetUserInfoResponse,
} from './model'
import { DeviceNotConnectedError, UserNotFoundError, FileNotFoundError } from './errors'
import { logger } from '../../lib/logger'
import { syncProgressManager } from './sync-progress-manager'
import { SyncLogService } from './sync-log.service'
import { getBackendUrl } from '../../config/network'
import { processUserAvatar, delay, SYNC_CONFIG, checkImageSize } from './image-processor'

/**
 * WebSocket 服务类
 * 处理设备命令和业务逻辑
 */
export class WebSocketService {
  // 从统一配置读取BASE_URL，确保与前端一致
  private static readonly BASE_URL = getBackendUrl()
  
  // 同步锁，防止并发同步
  private static isSyncing = false
  private static syncStartTime: number | null = null
  private static readonly SYNC_TIMEOUT = 30 * 60 * 1000 // 30分钟超时

  /**
   * 构建添加用户命令（公共方法）
   * @param processedAvatarPath 已处理的头像路径（可能是压缩后的缩略图）
   */
  private static buildAddUserCommand(user: any, processedAvatarPath?: string): any {
    const avatarPath = processedAvatarPath || user.avatar
    const photoUrl = avatarPath ? `${this.BASE_URL}${avatarPath}` : ''
    
    // 🔍 打印照片URL用于调试
    if (photoUrl) {
      logger.info(`📸 ${user.name}(${user.lotusId}) 照片URL: ${photoUrl}`)
    } else {
      logger.warn(`⚠️  ${user.name}(${user.lotusId}) 没有照片`)
    }
    
    return {
      cmd:           'addUser',
      mode:          0,
      name:          user.name,
      user_id:       user.lotusId!,
      user_id_card:  user.idNumber || '',
      face_template: photoUrl,
      phone:         user.phone || '',
    }
  }

  /**
   * 发送添加用户命令（公共方法）
   */
  private static sendAddUserCommand(command: any, user: any): boolean {
    logger.info(`📋 下发命令:`, JSON.stringify(command, null, 2))
    
    const success = ConnectionManager.sendToAttendanceDevice(command)
    
    if (success) {
      syncProgressManager.incrementSent(user.lotusId!, user.name)
      logger.info(`📤 已发送: ${user.name}(${user.lotusId})，等待考勤机确认...`)
    } else {
      logger.error(`❌ 发送失败: ${user.name}(${user.lotusId})`)
    }
    
    return success
  }

  /**
   * 添加单个用户到考勤设备
   */
  static async addUser(lotusId: string) {
    // 查询用户信息
    const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

    if (!user) {
      throw new UserNotFoundError(lotusId)
    }

    // 初始化进度管理器（单个用户）
    syncProgressManager.startSync(1)

    // 构建命令
    const command = this.buildAddUserCommand(user)

    // 发送命令
    const success = this.sendAddUserCommand(command, user)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '命令已发送，等待考勤机确认',
      data:    {
        lotusId: user.lotusId,
        name:    user.name,
      },
    }
  }

  /**
   * 照片预检查
   */
  static async validatePhoto(photoUrl: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      // 使用 Promise.race 实现超时
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await Promise.race([
        fetch(photoUrl, { method: 'HEAD', signal: controller.signal }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 3000)
        )
      ])
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        return { valid: false, reason: 'unreachable' }
      }
      return { valid: true }
    } catch (error: any) {
      if (error.message === 'timeout' || error.name === 'AbortError') {
        return { valid: false, reason: 'timeout' }
      }
      return { valid: false, reason: 'network_error' }
    }
  }

  /**
   * 添加所有用户到考勤设备
   * @param strategy 同步策略: 'all' | 'unsynced' | 'changed'
   * @param validatePhotos 是否预检查照片
   * @param photoFormat 照片格式: 'url' | 'base64'
   */
  static async addAllUsers(options?: { 
    strategy?: 'all' | 'unsynced' | 'changed'; 
    validatePhotos?: boolean;
    photoFormat?: 'url' | 'base64';
  }) {
    // 检查是否正在同步（带超时检测）
    if (this.isSyncing) {
      // 检查是否超时
      if (this.syncStartTime && Date.now() - this.syncStartTime > this.SYNC_TIMEOUT) {
        logger.warn(`⚠️  检测到同步超时，自动释放锁`)
        this.isSyncing = false
        this.syncStartTime = null
      } else {
        throw new Error('同步正在进行中，请稍后再试')
      }
    }

    try {
      this.isSyncing = true
      this.syncStartTime = Date.now()
      
      const { strategy = 'all', validatePhotos = false, photoFormat = 'url' } = options || {}

      // 根据策略查询用户
      let query = db.select().from(volunteer).where(eq(volunteer.status, 'active'))
      
      let users = await query

    // 应用同步策略
    if (strategy === 'unsynced') {
      users = users.filter(u => !u.syncToAttendance)
      logger.info(`📋 策略: 仅同步未同步的义工 (${users.length}个)`)
    } else if (strategy === 'changed') {
      // 检查是否有 updatedAt 字段
      const hasUpdatedAt = users.length > 0 && users[0].updatedAt !== undefined
      if (hasUpdatedAt) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        users = users.filter(u => u.updatedAt && new Date(u.updatedAt) > oneDayAgo)
        logger.info(`📋 策略: 仅同步最近24小时修改的义工 (${users.length}个)`)
      } else {
        logger.warn(`⚠️  数据库缺少 updatedAt 字段，改为全量同步`)
        logger.info(`📋 策略: 全量同步所有激活义工`)
      }
    } else {
      logger.info(`📋 策略: 全量同步所有激活义工`)
    }

    logger.info(`📊 共查询到 ${users.length} 个义工用于同步考勤机`)
    logger.info(`📸 照片格式: ${photoFormat === 'base64' ? 'Base64编码' : 'HTTP URL'}`)
    if (photoFormat === 'url') {
      logger.info(`🌐 照片服务器地址: ${this.BASE_URL}`)
      logger.info(`💡 提示: 请确保考勤机能访问此地址`)
    }
    logger.info(`⏱️  同步间隔: ${SYNC_CONFIG.DELAY_BETWEEN_USERS}ms/人`)
    logger.info(`📏 图片大小限制: ${SYNC_CONFIG.MAX_IMAGE_SIZE / 1024}KB，超过将自动压缩`)

    // 初始化进度管理器并获取批次ID
    const batchId = syncProgressManager.startSync(users.length)

    // 🔔 广播批次开始到前端
    const { broadcastBatchStart } = await import('./index')
    broadcastBatchStart({
      batchId,
      total: users.length,
      strategy,
      photoFormat,
    })

    // 创建同步批次记录
    await SyncLogService.createBatch({
      batchId,
      totalCount: users.length,
      syncStrategy: strategy,
    })

    let successCount = 0
    let failCount = 0
    let skippedCount = 0
    let compressedCount = 0

    const failedUsers: { lotusId: string | null; name: string; reason: string }[] = []
    const skippedUsers: { lotusId: string | null; name: string; reason: string }[] = []

    // 批量发送命令
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      
      // 跳过没有头像的用户（考勤机需要人脸照片）
      if (!user.avatar) {
        logger.warn(`⏭️  跳过 ${user.name}(${user.lotusId}): 无头像`)
        skippedCount++
        skippedUsers.push({ lotusId: user.lotusId || null, name: user.name, reason: '无头像' })
        syncProgressManager.incrementSkipped(user.lotusId!, user.name, '无头像')
        
        // 记录跳过日志
        await SyncLogService.logSync({
          batchId,
          lotusId: user.lotusId!,
          name: user.name,
          photoUrl: '',
          status: 'skipped',
          errorMessage: '无头像',
        })
        continue
      }

      // 🔧 根据照片格式处理图片
      let processedAvatarPath = user.avatar
      let photoUrl = ''
      let isBase64 = false
      
      if (photoFormat === 'base64') {
        // Base64 模式：转换图片为 Base64 格式
        try {
          const { convertImageToBase64 } = await import('./image-processor')
          photoUrl = await convertImageToBase64(user.avatar)
          isBase64 = true
          
          // 检查Base64大小（粗略估算）
          const base64Size = photoUrl.length * 0.75 / 1024 // 转换为KB
          if (base64Size > 500) {
            logger.warn(`⚠️  Base64过大: ${user.name}(${user.lotusId}) - ${base64Size.toFixed(1)}KB`)
          }
          
          logger.info(`📦 Base64转换: ${user.name}(${user.lotusId}) - ${base64Size.toFixed(1)}KB`)
        } catch (error: any) {
          logger.error(`❌ Base64转换失败: ${user.name}(${user.lotusId}) - ${error.message}`)
          skippedCount++
          skippedUsers.push({ lotusId: user.lotusId || null, name: user.name, reason: 'Base64转换失败' })
          syncProgressManager.incrementSkipped(user.lotusId!, user.name, 'Base64转换失败')
          
          await SyncLogService.logSync({
            batchId,
            lotusId: user.lotusId!,
            name: user.name,
            photoUrl: user.avatar, // 存储原始路径
            status: 'skipped',
            errorMessage: 'Base64转换失败',
          })
          continue
        }
      } else {
        // URL 模式：检查并压缩图片
        const imageInfo = checkImageSize(user.avatar)
        
        if (imageInfo.needsCompression) {
          logger.info(`🔄 压缩图片: ${user.name}(${user.lotusId})`)
          processedAvatarPath = await processUserAvatar(user.avatar)
          if (processedAvatarPath !== user.avatar) {
            compressedCount++
          }
        }

        photoUrl = `${this.BASE_URL}${processedAvatarPath}`
      }

      // 照片预检查（仅URL模式）
      if (validatePhotos && !isBase64) {
        const validation = await this.validatePhoto(photoUrl)
        if (!validation.valid) {
          logger.warn(`⏭️  跳过 ${user.name}(${user.lotusId}): 照片无法访问`)
          skippedCount++
          const reason = validation.reason === 'network_error' ? '照片网络错误' : '照片无法访问'
          skippedUsers.push({ 
            lotusId: user.lotusId || null, 
            name: user.name, 
            reason,
          })
          syncProgressManager.incrementSkipped(user.lotusId!, user.name, reason)
          
          // 记录跳过日志
          await SyncLogService.logSync({
            batchId,
            lotusId: user.lotusId!,
            name: user.name,
            photoUrl: processedAvatarPath, // 存储路径而非URL
            status: 'skipped',
            errorMessage: reason,
          })
          continue
        }
      }
      
      // 构建命令：Base64模式直接使用photoUrl，URL模式使用processedAvatarPath
      const command = isBase64 
        ? { ...this.buildAddUserCommand(user, ''), face_template: photoUrl }
        : this.buildAddUserCommand(user, processedAvatarPath)

      // 记录待处理日志（Base64模式只存储原始路径）
      await SyncLogService.logSync({
        batchId,
        lotusId: user.lotusId!,
        name: user.name,
        photoUrl: isBase64 ? `${user.avatar} (Base64)` : photoUrl,
        status: 'pending',
      })

      // 使用公共方法发送命令
      if (this.sendAddUserCommand(command, user)) {
        successCount++
      } else {
        failCount++
        failedUsers.push({ lotusId: user.lotusId || null, name: user.name, reason: '设备未连接' })
        
        // 更新为失败状态
        await SyncLogService.updateSyncStatus({
          batchId,
          lotusId: user.lotusId!,
          status: 'failed',
          errorCode: -1,
          errorMessage: '设备未连接',
        })
      }

      // ⏱️ 添加同步间隔，避免考勤机处理不过来
      if (i < users.length - 1) {
        await delay(SYNC_CONFIG.DELAY_BETWEEN_USERS)
      }
    }

    if (compressedCount > 0) {
      logger.info(`📦 共压缩 ${compressedCount} 张图片`)
    }

    logger.success(`📊 同步完成: 成功 ${successCount}, 失败 ${failCount}, 跳过 ${skippedCount}`)

      return {
        success: true,
        message: `批量添加完成`,
        data:    {
          total:        users.length,
          successCount,
          failCount,
          skippedCount,
          failedUsers,
          skippedUsers,
        },
      }
    } finally {
      // 释放同步锁
      this.isSyncing = false
      this.syncStartTime = null
    }
  }

  /**
   * 重试失败的用户
   */
  static async retryFailedUsers(failedUsers: Array<{ lotusId: string; name: string }>) {
    logger.info(`🔄 开始重试 ${failedUsers.length} 个失败的义工`)
    
    syncProgressManager.startSync(failedUsers.length)

    let successCount = 0
    let failCount = 0

    for (const { lotusId } of failedUsers) {
      try {
        await this.addUser(lotusId)
        successCount++
      } catch (error) {
        failCount++
        logger.error(`❌ 重试失败: ${lotusId}`)
      }
    }

    return {
      success: true,
      message: `重试完成`,
      data: {
        total: failedUsers.length,
        successCount,
        failCount,
      },
    }
  }

  /**
   * 使用Base64格式重试失败的用户
   */
  static async retryFailedUsersWithBase64(failedUsers: Array<{ lotusId: string; name: string }>) {
    logger.info(`🔄 开始使用Base64格式重试 ${failedUsers.length} 个失败的义工`)
    
    syncProgressManager.startSync(failedUsers.length)

    let successCount = 0
    let failCount = 0
    const failedList: Array<{ lotusId: string; name: string; reason: string }> = []

    for (const { lotusId } of failedUsers) {
      try {
        // 查询用户信息
        const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, lotusId))

        if (!user) {
          throw new Error('用户不存在')
        }

        if (!user.avatar) {
          throw new Error('用户没有头像')
        }

        // 将图片转换为Base64格式
        const { convertImageToBase64 } = await import('./image-processor')
        const base64Photo = await convertImageToBase64(user.avatar)

        // 构建命令（使用Base64格式的照片）
        const command = {
          cmd:           'addUser',
          mode:          0,
          name:          user.name,
          user_id:       user.lotusId!,
          user_id_card:  user.idNumber || '',
          face_template: base64Photo, // 使用Base64格式
          phone:         user.phone || '',
        }

        logger.info(`📋 下发Base64命令: ${user.name}(${user.lotusId})`)
        
        // 发送命令
        const success = this.sendAddUserCommand(command, user)

        if (success) {
          successCount++
        } else {
          failCount++
          failedList.push({ lotusId: user.lotusId!, name: user.name, reason: '设备未连接' })
        }

        // 添加延迟
        if (failedUsers.indexOf({ lotusId, name: user.name }) < failedUsers.length - 1) {
          await delay(SYNC_CONFIG.DELAY_BETWEEN_USERS)
        }
      } catch (error: any) {
        failCount++
        failedList.push({ lotusId, name: failedUsers.find(u => u.lotusId === lotusId)?.name || lotusId, reason: error.message })
        logger.error(`❌ Base64重试失败: ${lotusId} - ${error.message}`)
      }
    }

    logger.success(`📊 Base64重试完成: 成功 ${successCount}, 失败 ${failCount}`)

    return {
      success: true,
      message: `Base64重试完成`,
      data: {
        total: failedUsers.length,
        successCount,
        failCount,
        failedUsers: failedList,
      },
    }
  }

  /**
   * 删除所有用户
   */
  static async deleteAllUsers() {
    const command: DeleteAllUsersCommand = {
      cmd: 'delAllUser',
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    logger.info(`📤 已发送清空设备命令，等待考勤机确认...`)

    return {
      success: true,
      message: '删除命令已发送，等待考勤机确认',
    }
  }

  /**
   * 处理考勤机返回的清空所有用户结果
   * @param code 返回码 (0=成功)
   * @param msg 返回消息
   */
  static async handleDeleteAllUsersResult(code: number, msg: string) {
    try {
      if (code === 0) {
        // 清空成功，清除数据库中所有义工的同步标记
        await db
          .update(volunteer)
          .set({ syncToAttendance: false })
          .where(eq(volunteer.syncToAttendance, true))

        logger.success(`✅ 考勤机确认清空成功，已清除数据库同步标记`)

        // 🔔 广播清空完成到前端
        const { broadcastClearDeviceComplete } = await import('./index')
        broadcastClearDeviceComplete({
          success: true,
          code,
          message: '设备用户已清空，数据库同步标记已重置',
        })
      } else {
        logger.error(`❌ 考勤机返回清空失败: [错误码:${code}] ${msg}`)

        // 🔔 广播清空失败到前端
        const { broadcastClearDeviceComplete } = await import('./index')
        broadcastClearDeviceComplete({
          success: false,
          code,
          message: msg || '清空失败',
        })
      }
    } catch (error) {
      logger.error(`处理清空设备返回结果失败:`, error)
    }
  }

  /**
   * 在线授权
   */
  static async onlineAuthorization() {
    const command: OnlineAuthorizationCommand = {
      cmd: 'onlineAuthorization',
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '授权命令已发送',
    }
  }

  /**
   * 添加图片广告
   */
  static async addImageAd(params?: { id?: string; duration?: string; imageUrl?: string }) {
    const {
      id = 'test1',
      duration = '2000',
      imageUrl = `${this.BASE_URL}/public/abc.jpg`,
    } = params || {}

    // 检查文件是否存在（如果是本地文件）
    if (imageUrl.startsWith(this.BASE_URL)) {
      const localPath = imageUrl.replace(this.BASE_URL, 'public')
      const file = fileType(localPath)

      if (!(await file.exists())) {
        throw new FileNotFoundError(localPath)
      }
    }

    const command: AddImageAdCommand = {
      cmd:   'addImageAd',
      id,
      duration,
      value: imageUrl,
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '广告添加成功',
      data:    {
        id,
        imageUrl,
      },
    }
  }

  /**
   * 设置访客申请二维码
   */
  static async setVisitorQRCode(params?: { value?: number; photoUrl?: string }) {
    const { value = 0, photoUrl = `${this.BASE_URL}/public/123.jpg` } = params || {}

    const command: SetVisitorQRCodeCommand = {
      cmd:   'setVisitorApplyValue',
      value,
      photo: photoUrl,
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    return {
      success: true,
      message: '二维码设置成功',
      data:    {
        value,
        photoUrl,
      },
    }
  }

  /**
   * 错误码映射
   */
  private static readonly ERROR_MESSAGES: Record<number, string> = {
    0: '成功',
    11: '没有找到有效人脸',
    12: '人脸宽度不符合标准',
    13: '人脸高度不符合标准',
    14: '人脸清晰度不符合标准',
    15: '人脸亮度不符合标准',
    16: '人脸亮度标准差不符合标准',
  }

  /**
   * 处理考勤机返回的添加用户结果
   * @param userId 用户的lotusId
   * @param code 返回码 (0=成功, 11-16=各种失败原因)
   * @param msg 返回消息
   */
  static async handleAddUserResult(userId: string, code: number, msg: string) {
    try {
      // 查询用户名
      const [user] = await db.select().from(volunteer).where(eq(volunteer.lotusId, userId))
      const userName = user?.name || userId

      // 获取详细的错误信息
      const errorMessage = this.ERROR_MESSAGES[code] || msg || '未知错误'
      
      // 获取当前批次ID
      const batchId = syncProgressManager.getBatchId()

      if (code === 0) {
        // 同步成功，更新数据库
        await db
          .update(volunteer)
          .set({ syncToAttendance: true })
          .where(eq(volunteer.lotusId, userId))
        
        syncProgressManager.incrementConfirmed(userId, userName)
        logger.success(`✅ 考勤机确认成功: ${userId}`)
        
        // 更新同步记录
        if (batchId) {
          await SyncLogService.updateSyncStatus({
            batchId,
            lotusId: userId,
            status: 'success',
          })
        }

        // 🔔 广播用户反馈到前端
        const { broadcastUserFeedback } = await import('./index')
        broadcastUserFeedback({
          batchId,
          lotusId: userId,
          name: userName,
          status: 'success',
          code,
          message: '同步成功',
        })
      } else {
        // 同步失败，记录详细错误
        syncProgressManager.incrementFailed(userId, userName, errorMessage)
        logger.error(`❌ 考勤机返回失败: ${userName}(${userId}) - [错误码:${code}] ${errorMessage}`)
        
        // 更新同步记录
        if (batchId) {
          await SyncLogService.updateSyncStatus({
            batchId,
            lotusId: userId,
            status: 'failed',
            errorCode: code,
            errorMessage,
          })
        }

        // 🔔 广播用户反馈到前端
        const { broadcastUserFeedback } = await import('./index')
        broadcastUserFeedback({
          batchId,
          lotusId: userId,
          name: userName,
          status: 'failed',
          code,
          message: errorMessage,
        })
        
        // 🔍 如果是照片相关错误，打印用户的照片URL
        if (code === 1 || errorMessage.includes('照片') || errorMessage.includes('人脸')) {
          if (user?.avatar) {
            const photoUrl = `${this.BASE_URL}${user.avatar}`
            logger.error(`🔗 照片URL: ${photoUrl}`)
            logger.error(`💡 请在浏览器中访问此URL检查照片是否可访问`)
            logger.error(`💡 请确保考勤机能访问服务器地址: ${this.BASE_URL}`)
          } else {
            logger.error(`⚠️  用户没有照片记录`)
          }
        }
      }
      
      // 检查是否同步完成，如果完成则更新批次记录并广播
      const stats = syncProgressManager.getSyncStats()
      if (stats.status === 'completed' && batchId) {
        const startTime = syncProgressManager.getProgress().startTime
        const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 0

        await SyncLogService.completeBatch({
          batchId,
          successCount: stats.confirmed,
          failedCount: stats.failed,
          skippedCount: stats.skipped,
        })

        // 🔔 广播批次完成到前端
        const { broadcastBatchComplete } = await import('./index')
        broadcastBatchComplete({
          batchId,
          total: stats.total,
          confirmed: stats.confirmed,
          failed: stats.failed,
          skipped: stats.skipped,
          duration,
        })
      }
    } catch (error) {
      logger.error(`处理考勤机返回结果失败:`, error)
    }
  }

  /**
   * 获取设备状态
   */
  static getDeviceStatus() {
    const isOnline = ConnectionManager.isOnline('YET88476')
    const onlineDevices = ConnectionManager.getOnlineDevices()

    // 构建设备列表，格式与前端期望一致
    const devices = [{
      deviceSn: 'YET88476',
      online: isOnline,
    }]

    return {
      success: true,
      data:    {
        devices,  // 前端期望的格式
        onlineDevices,
        totalOnline: ConnectionManager.getOnlineCount(),
      },
    }
  }

  /**
   * 获取同步进度
   */
  static getSyncProgress() {
    return syncProgressManager.getProgress()
  }

  // ==================== 设备人员查询 ====================
  
  // 存储待处理的查询请求
  private static pendingUserInfoRequests: Map<string, {
    resolve: (value: GetUserInfoResponse) => void
    reject: (reason: any) => void
    timeout: ReturnType<typeof setTimeout>
  }> = new Map()

  /**
   * 查询设备人员信息
   * @param value 0=人脸总数, 1=所有人员user id, 2=人证总数, 3=所有人证user id
   */
  static async getUserInfo(value: 0 | 1 | 2 | 3 = 0): Promise<GetUserInfoResponse> {
    const command: GetUserInfoCommand = {
      cmd: 'getUserInfo',
      value,
    }

    const success = ConnectionManager.sendToAttendanceDevice(command)

    if (!success) {
      throw new DeviceNotConnectedError('YET88476')
    }

    logger.info(`📊 查询设备人员信息: value=${value}`)

    // 创建一个 Promise 等待设备返回
    return new Promise((resolve, reject) => {
      const requestId = `getUserInfo_${value}_${Date.now()}`
      
      // 设置超时（10秒）
      const timeout = setTimeout(() => {
        this.pendingUserInfoRequests.delete(requestId)
        reject(new Error('查询超时，设备未响应'))
      }, 10000)

      this.pendingUserInfoRequests.set(requestId, { resolve, reject, timeout })
      
      // 存储当前查询类型，用于匹配响应
      this.currentUserInfoQueryType = value
    })
  }

  // 当前查询类型
  private static currentUserInfoQueryType: number | null = null

  /**
   * 处理设备返回的人员信息
   */
  static handleGetUserInfoResult(response: GetUserInfoResponse) {
    logger.info(`📊 收到设备人员信息: code=${response.code}, total=${response.total}, userIds=${response.userIds?.length || 0}个`)

    // 找到并处理待处理的请求
    for (const [requestId, request] of this.pendingUserInfoRequests) {
      clearTimeout(request.timeout)
      this.pendingUserInfoRequests.delete(requestId)
      
      if (response.code === 0) {
        request.resolve(response)
      } else {
        request.reject(new Error(`设备返回错误: code=${response.code}`))
      }
      break // 只处理第一个匹配的请求
    }

    this.currentUserInfoQueryType = null
  }

  /**
   * 获取设备人脸总数
   */
  static async getDeviceFaceCount(): Promise<{ total: number }> {
    const response = await this.getUserInfo(0)
    return { total: response.total || 0 }
  }

  /**
   * 获取设备所有人员ID
   */
  static async getDeviceUserIds(): Promise<{ userIds: string[] }> {
    const response = await this.getUserInfo(1)
    return { userIds: response.userIds || [] }
  }

  /**
   * 对比设备人员和数据库义工
   * @param deviceUserIds 设备上的人员ID列表
   */
  static async compareDeviceUsers(deviceUserIds: string[]) {
    // 查询数据库中所有激活的义工
    const allVolunteers = await db
      .select({
        lotusId: volunteer.lotusId,
        name: volunteer.name,
        syncToAttendance: volunteer.syncToAttendance,
      })
      .from(volunteer)
      .where(eq(volunteer.status, 'active'))

    // 创建设备ID集合用于快速查找
    const deviceIdSet = new Set(deviceUserIds)

    // 分类义工
    const inDevice: Array<{ lotusId: string; name: string }> = []
    const notInDevice: Array<{ lotusId: string; name: string; syncToAttendance: boolean }> = []

    allVolunteers.forEach((v) => {
      if (v.lotusId && deviceIdSet.has(v.lotusId)) {
        inDevice.push({
          lotusId: v.lotusId,
          name: v.name,
        })
      } else if (v.lotusId) {
        notInDevice.push({
          lotusId: v.lotusId,
          name: v.name,
          syncToAttendance: v.syncToAttendance || false,
        })
      }
    })

    // 找出设备上有但数据库没有的ID（可能是已删除的义工）
    const dbIdSet = new Set(allVolunteers.map(v => v.lotusId).filter(Boolean))
    const orphanedIds = deviceUserIds.filter(id => !dbIdSet.has(id))

    return {
      total: allVolunteers.length,
      inDevice: inDevice.length,
      notInDevice: notInDevice.length,
      orphanedIds: orphanedIds.length,
      inDeviceList: inDevice,
      notInDeviceList: notInDevice,
      orphanedIdsList: orphanedIds,
    }
  }
}
