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
  }

  private callbacks: Set<(progress: SyncProgress) => void> = new Set()
  private readonly MAX_LOGS = 100 // 最多保留100条日志

  /**
   * 开始新的同步任务
   */
  startSync(total: number) {
    this.progress = {
      total,
      sent: 0,
      confirmed: 0,
      failed: 0,
      skipped: 0,
      status: 'syncing',
      logs: [],
      failedUsers: [],
    }
    this.addLog('info', `开始同步，共 ${total} 个义工`)
    this.notifyListeners()
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
  incrementConfirmed(userId: string, name: string) {
    this.progress.confirmed++
    this.addLog('success', `✅ 成功: ${name} (${userId})`, userId)
    this.checkCompletion()
    this.notifyListeners()
  }

  /**
   * 记录失败
   */
  incrementFailed(userId: string, name: string, reason: string) {
    this.progress.failed++
    this.progress.failedUsers.push({ lotusId: userId, name, reason })
    this.addLog('error', `❌ 失败: ${name} (${userId}) - ${reason}`, userId)
    this.checkCompletion()
    this.notifyListeners()
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
    this.progress = {
      total: 0,
      sent: 0,
      confirmed: 0,
      failed: 0,
      skipped: 0,
      status: 'idle',
      logs: [],
      failedUsers: [],
    }
    this.notifyListeners()
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
