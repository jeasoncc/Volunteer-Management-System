/**
 * 同步进度管理器
 * 用于追踪批量同步的进度并广播给所有连接的客户端
 */

interface SyncLog {
  time: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  userId?: string
}

interface SyncProgress {
  total: number
  sent: number
  confirmed: number
  failed: number
  skipped: number
  status: 'idle' | 'syncing' | 'completed'
  logs: SyncLog[]
  failedUsers: Array<{ lotusId: string; name: string; reason: string }>
  // 新增：时间相关字段
  startTime: number | null
  estimatedTimeRemaining: number | null  // 预估剩余时间（秒）
  averageTimePerUser: number | null      // 平均每个用户耗时（秒）
  batchId: string | null                 // 批次ID
}

class SyncProgressManager {
  private progress: SyncProgress = {
    total: 0,
    sent: 0,
    confirmed: 0,
    failed: 0,
    skipped: 0,
    status: 'idle',
    logs: [],
    failedUsers: [],
    startTime: null,
    estimatedTimeRemaining: null,
    averageTimePerUser: null,
    batchId: null,
  }

  private callbacks: Set<(progress: SyncProgress) => void> = new Set()
  private readonly MAX_LOGS = 100 // 最多保留100条日志
  private processedTimes: number[] = [] // 记录每个用户的处理时间

  /**
   * 生成批次ID
   */
  private generateBatchId(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const random = Math.random().toString(36).substring(2, 6)
    return `SYNC-${dateStr}-${timeStr}-${random}`
  }

  /**
   * 开始新的同步任务
   */
  startSync(total: number) {
    const batchId = this.generateBatchId()
    this.processedTimes = []
    this.progress = {
      total,
      sent: 0,
      confirmed: 0,
      failed: 0,
      skipped: 0,
      status: 'syncing',
      logs: [],
      failedUsers: [],
      startTime: Date.now(),
      estimatedTimeRemaining: null,
      averageTimePerUser: null,
      batchId,
    }
    this.addLog('info', `开始同步，共 ${total} 个义工 [批次: ${batchId}]`)
    this.notifyListeners()
    return batchId
  }

  /**
   * 记录已发送
   */
  incrementSent(userId: string, name: string) {
    this.progress.sent++
    this.addLog('info', `📤 发送: ${name} (${userId})`, userId)
    this.notifyListeners()
  }

  /**
   * 记录确认成功
   */
  incrementConfirmed(userId: string, name: string, photoInfo?: string) {
    this.progress.confirmed++
    this.recordProcessTime()
    this.updateEstimatedTime()
    
    // 如果有照片信息，添加到成功消息中
    const message = photoInfo 
      ? `✅ 成功: ${name} (${userId}) [${photoInfo}]`
      : `✅ 成功: ${name} (${userId})`
    
    this.addLog('success', message, userId)
    this.checkCompletion()
    this.notifyListeners()
  }

  /**
   * 记录失败
   */
  incrementFailed(userId: string, name: string, reason: string, photoInfo?: string) {
    this.progress.failed++
    this.progress.failedUsers.push({ lotusId: userId, name, reason })
    this.recordProcessTime()
    this.updateEstimatedTime()
    
    // 如果有照片信息，添加到失败消息中
    const message = photoInfo 
      ? `❌ 失败: ${name} (${userId}) - ${reason} [${photoInfo}]`
      : `❌ 失败: ${name} (${userId}) - ${reason}`
    
    this.addLog('error', message, userId)
    this.checkCompletion()
    this.notifyListeners()
  }

  /**
   * 记录处理时间
   */
  private recordProcessTime() {
    if (this.progress.startTime) {
      const processed = this.progress.confirmed + this.progress.failed
      if (processed > 0) {
        const elapsed = (Date.now() - this.progress.startTime) / 1000
        const avgTime = elapsed / processed
        this.processedTimes.push(avgTime)
        
        // 只保留最近20个样本用于计算平均值
        if (this.processedTimes.length > 20) {
          this.processedTimes.shift()
        }
      }
    }
  }

  /**
   * 更新预估完成时间
   */
  private updateEstimatedTime() {
    const processed = this.progress.confirmed + this.progress.failed
    const remaining = this.progress.sent - processed
    
    if (processed > 0 && this.progress.startTime) {
      const elapsed = (Date.now() - this.progress.startTime) / 1000
      const avgTimePerUser = elapsed / processed
      
      this.progress.averageTimePerUser = Math.round(avgTimePerUser * 10) / 10
      this.progress.estimatedTimeRemaining = Math.round(remaining * avgTimePerUser)
    }
  }

  /**
   * 记录跳过
   */
  incrementSkipped(userId: string, name: string, reason: string) {
    this.progress.skipped++
    this.addLog('warning', `⏭️ 跳过: ${name} (${userId}) - ${reason}`, userId)
    this.notifyListeners()
  }

  /**
   * 添加自定义日志（公共方法）
   */
  addCustomLog(type: SyncLog['type'], message: string, userId?: string) {
    this.addLog(type, message, userId)
    this.notifyListeners()
  }

  /**
   * 添加日志
   */
  private addLog(type: SyncLog['type'], message: string, userId?: string) {
    const log: SyncLog = {
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      type,
      message,
      userId,
    }
    this.progress.logs.push(log)
    
    // 限制日志数量
    if (this.progress.logs.length > this.MAX_LOGS) {
      this.progress.logs.shift()
    }
  }

  /**
   * 检查是否完成
   * 当考勤机反馈的数量（成功+失败）达到已发送的数量时，同步完成
   */
  private checkCompletion() {
    const processed = this.progress.confirmed + this.progress.failed
    // 只有当所有已发送的命令都收到反馈时才算完成
    if (processed >= this.progress.sent) {
      this.progress.status = 'completed'
      this.addLog('info', `🎉 同步完成！成功 ${this.progress.confirmed}，失败 ${this.progress.failed}，跳过 ${this.progress.skipped}`)
    }
  }

  /**
   * 获取当前进度
   */
  getProgress(): SyncProgress {
    return { ...this.progress }
  }

  /**
   * 订阅进度更新
   */
  subscribe(callback: (progress: SyncProgress) => void) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * 通知所有监听者
   */
  private notifyListeners() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getProgress())
      } catch (error) {
        // 静默处理回调错误，避免日志污染
      }
    })
  }

  /**
   * 重置进度
   */
  reset() {
    this.processedTimes = []
    this.progress = {
      total: 0,
      sent: 0,
      confirmed: 0,
      failed: 0,
      skipped: 0,
      status: 'idle',
      logs: [],
      failedUsers: [],
      startTime: null,
      estimatedTimeRemaining: null,
      averageTimePerUser: null,
      batchId: null,
    }
    this.notifyListeners()
  }

  /**
   * 获取批次ID
   */
  getBatchId(): string | null {
    return this.progress.batchId
  }

  /**
   * 获取同步统计信息
   */
  getSyncStats() {
    const elapsed = this.progress.startTime 
      ? Math.round((Date.now() - this.progress.startTime) / 1000)
      : 0
    
    return {
      batchId: this.progress.batchId,
      total: this.progress.total,
      sent: this.progress.sent,
      confirmed: this.progress.confirmed,
      failed: this.progress.failed,
      skipped: this.progress.skipped,
      status: this.progress.status,
      elapsedTime: elapsed,
      estimatedTimeRemaining: this.progress.estimatedTimeRemaining,
      averageTimePerUser: this.progress.averageTimePerUser,
      failedUsers: this.progress.failedUsers,
    }
  }

  /**
   * 获取失败的用户列表
   */
  getFailedUsers() {
    return [...this.progress.failedUsers]
  }
}

// 导出单例
export const syncProgressManager = new SyncProgressManager()
