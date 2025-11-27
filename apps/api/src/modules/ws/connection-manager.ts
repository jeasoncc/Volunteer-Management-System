import { ElysiaWS } from 'elysia/dist/ws'

/**
 * WebSocket 连接管理器
 * 管理所有设备的 WebSocket 连接
 */
export class ConnectionManager {
  private static connections = new Map<string, ElysiaWS>()
  private static readonly ATTENDANCE_DEVICE_SN = 'YET88476' // 考勤设备编号

  /**
   * 注册设备连接
   */
  static register(deviceSn: string, ws: ElysiaWS): void {
    this.connections.set(deviceSn, ws)
    console.log(`✅ 设备 ${deviceSn} 已连接，当前连接数: ${this.connections.size}`)
  }

  /**
   * 移除设备连接
   */
  static unregister(deviceSn: string): void {
    const removed = this.connections.delete(deviceSn)
    if (removed) {
      console.log(`❌ 设备 ${deviceSn} 已断开，当前连接数: ${this.connections.size}`)
    }
  }

  /**
   * 获取设备连接
   */
  static getConnection(deviceSn: string): ElysiaWS | undefined {
    return this.connections.get(deviceSn)
  }

  /**
   * 获取考勤设备连接
   */
  static getAttendanceDevice(): ElysiaWS | undefined {
    return this.connections.get(this.ATTENDANCE_DEVICE_SN)
  }

  /**
   * 检查设备是否在线
   */
  static isOnline(deviceSn: string): boolean {
    return this.connections.has(deviceSn)
  }

  /**
   * 获取所有在线设备
   */
  static getOnlineDevices(): string[] {
    return Array.from(this.connections.keys())
  }

  /**
   * 获取在线设备数量
   */
  static getOnlineCount(): number {
    return this.connections.size
  }

  /**
   * 发送命令到设备
   */
  static sendCommand(deviceSn: string, command: any): boolean {
    const ws = this.getConnection(deviceSn)

    if (!ws) {
      console.error(`❌ 设备 ${deviceSn} 未连接`)
      return false
    }

    try {
      const message = this.formatMessage(deviceSn, command)
      ws.send(JSON.stringify(message))
      console.log(`📤 发送命令到设备 ${deviceSn}:`, command.cmd || command)
      return true
    } catch (error) {
      console.error(`❌ 发送命令失败:`, error)
      return false
    }
  }

  /**
   * 发送命令到考勤设备
   */
  static sendToAttendanceDevice(command: any): boolean {
    return this.sendCommand(this.ATTENDANCE_DEVICE_SN, command)
  }

  /**
   * 格式化消息
   */
  private static formatMessage(deviceSn: string, command: any) {
    // 如果是字符串命令，转换为对象
    if (typeof command === 'string') {
      const message = {
        cmd:  'to_device',
        from: 'server',
        to:   deviceSn,
        data: {
          cmd: command,
        },
      }
      console.log(`📦 格式化消息（字符串）:`, JSON.stringify(message, null, 2))
      return message
    }

    // 如果是对象命令，直接包装
    const message = {
      cmd:  'to_device',
      from: 'server',
      to:   deviceSn,
      data: command,
    }
    console.log(`📦 格式化消息（对象）:`, JSON.stringify(message, null, 2))
    return message
  }

  /**
   * 广播消息到所有设备
   */
  static broadcast(command: any): number {
    let successCount = 0

    for (const deviceSn of this.connections.keys()) {
      if (this.sendCommand(deviceSn, command)) {
        successCount++
      }
    }

    return successCount
  }

  /**
   * 清空所有连接
   */
  static clear(): void {
    this.connections.clear()
    console.log('🧹 已清空所有连接')
  }
}
