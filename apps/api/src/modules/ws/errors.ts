import {
  AppError,
  NotFoundError,
  ServiceUnavailableError,
  InternalServerError,
} from '../../lib/errors/base'

/**
 * WebSocket 模块基础错误类
 */
export class WebSocketError extends AppError {
  constructor(message: string, code: string = 'WS_ERROR', status: number = 500, details?: any) {
    super(message, code, status, details)
  }
}

/**
 * 设备未连接错误
 */
export class DeviceNotConnectedError extends ServiceUnavailableError {
  constructor(deviceSn: string) {
    super(`设备 ${deviceSn} 未连接`, { deviceSn })
    this.code = 'DEVICE_NOT_CONNECTED'
  }
}

/**
 * 命令发送失败错误
 */
export class CommandSendError extends InternalServerError {
  constructor(command: string, reason?: string) {
    super(`命令发送失败: ${command}${reason ? ` - ${reason}` : ''}`, { command, reason })
    this.code = 'COMMAND_SEND_ERROR'
  }
}

/**
 * 用户不存在错误
 */
export class UserNotFoundError extends NotFoundError {
  constructor(lotusId: string) {
    super(`用户 ${lotusId}`)
    this.details = { lotusId }
  }
}

/**
 * 文件不存在错误
 */
export class FileNotFoundError extends NotFoundError {
  constructor(filePath: string) {
    super(`文件 ${filePath}`)
    this.details = { filePath }
  }
}
